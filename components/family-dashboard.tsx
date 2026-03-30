'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Calendar, FileText, User, Clock, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { Header } from '@/components/header';
import { StatusBadge } from '@/components/status-badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/toast-provider';
import { useAuth } from '@/lib/auth-context';
import { getPatientStatus, startCall, type Patient } from '@/lib/api';
import { cn } from '@/lib/utils';

export function FamilyDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [canJoinCall, setCanJoinCall] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!user?.patientId) return;
    
    setLoading(true);
    try {
      const data = await getPatientStatus(user.patientId);
      setPatient(data);
      
      if (data.scheduled_visit) {
        const scheduledTime = new Date(data.scheduled_visit).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        setCanJoinCall(data.call_active || (scheduledTime - now <= fiveMinutes && scheduledTime > now));
      } else {
        setCanJoinCall(data.call_active || false);
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      showToast('Failed to load patient information', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.patientId, showToast]);

  useEffect(() => {
    fetchPatient();
    const interval = setInterval(fetchPatient, 30000);
    return () => clearInterval(interval);
  }, [fetchPatient]);

  const handleJoinCall = async () => {
    if (!patient) return;
    
    try {
      const callData = await startCall(patient.id);
      showToast('Joining video call...', 'success');
      router.push(`/call?link=${encodeURIComponent(callData.call_link)}&room=${callData.room_name}&patientId=${patient.id}&name=${encodeURIComponent(user?.username || 'Family Member')}`);
    } catch (error) {
      console.error('Failed to join call:', error);
      showToast('Failed to join video call', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg pattern-dots">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="glass-card rounded-2xl p-8 animate-shimmer">
            <div className="flex items-center gap-5 mb-6">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-xl mb-6" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen gradient-bg pattern-dots">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Patient Not Found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Unable to load patient information. Please contact support.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pattern-dots">
      <Header title="Family Portal" />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Patient Info Card */}
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
          {/* Top Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
                  <p className="text-muted-foreground font-medium mt-1">Room {patient.room_number}</p>
                </div>
              </div>
              <StatusBadge status={patient.status} size="lg" />
            </div>

            {/* Call Active Banner */}
            {patient.call_active && (
              <div className="flex items-center gap-4 p-5 mb-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 animate-pulse-soft">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">
                    Video Call Active
                  </span>
                  <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                    A nurse has started the call - Join now!
                  </p>
                </div>
              </div>
            )}

            {/* Scheduled Visit */}
            {patient.scheduled_visit && (
              <div className="p-6 mb-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Next Scheduled Visit</span>
                  </div>
                  <CountdownTimer 
                    targetDate={patient.scheduled_visit}
                    onExpire={() => setCanJoinCall(true)}
                  />
                </div>
                <p className="text-xl font-semibold text-foreground">
                  {formatDate(patient.scheduled_visit)}
                </p>
              </div>
            )}

            {/* Join Call Button */}
            <Button
              onClick={handleJoinCall}
              disabled={!canJoinCall && !patient.call_active}
              size="lg"
              className={cn(
                "w-full h-16 text-lg font-semibold rounded-xl btn-premium transition-all duration-300",
                (canJoinCall || patient.call_active)
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-xl shadow-emerald-600/25"
                  : "bg-primary shadow-xl shadow-primary/20 disabled:opacity-60"
              )}
            >
              <Video className="w-6 h-6 mr-3" />
              {patient.call_active ? 'Join Active Call' : canJoinCall ? 'Join Video Call' : 'Waiting for Visit Time'}
            </Button>

            {!canJoinCall && !patient.call_active && patient.scheduled_visit && (
              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                You can join 5 minutes before the scheduled time
              </p>
            )}
          </div>
        </div>

        {/* Notes from Nurse */}
        <Card className="glass-card border-0 rounded-2xl overflow-hidden animate-slide-up stagger-2">
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Notes from Care Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {patient.notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No notes available yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Notes from the care team will appear here</p>
              </div>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-4">
                  {patient.notes.map((note, index) => (
                    <div
                      key={note.id}
                      className="p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/20 hover:border-border/40 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <p className="text-sm leading-relaxed mb-4">{note.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-2 font-medium">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          {note.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatNoteDate(note.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={fetchPatient}
          className="w-full h-14 gap-3 glass-card border-0 rounded-xl hover:bg-primary/5 transition-all duration-300 font-medium animate-slide-up stagger-3"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Information
        </Button>
      </main>
    </div>
  );
}
