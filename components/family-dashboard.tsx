'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Calendar, FileText, User, Clock, Heart, RefreshCw } from 'lucide-react';
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
      router.push(`/call?link=${encodeURIComponent(callData.call_link)}&room=${callData.room_name}&patientId=${patient.id}`);
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
      <div className="min-h-screen gradient-bg">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="glass-card p-8 rounded-2xl mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
            <Skeleton className="h-24 w-full mt-6 rounded-xl" />
            <Skeleton className="h-16 w-full mt-4 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl text-center">
          <div className="glass-card p-12 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Patient Not Found</h2>
            <p className="text-muted-foreground">Unable to load patient information.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header title="Family Portal" />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Patient Info Card */}
        <div className="glass-card overflow-hidden rounded-2xl">
          {/* Top gradient accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-accent" />
          
          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">{patient.name}</h2>
                  <p className="text-muted-foreground font-medium">Room {patient.room_number}</p>
                </div>
              </div>
              <StatusBadge status={patient.status} size="lg" />
            </div>

            {/* Call Active Banner */}
            {patient.call_active && (
              <div className="flex items-center gap-4 p-5 mb-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-blink" />
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-50" />
                </div>
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">
                  Video call is active - Join now!
                </span>
              </div>
            )}

            {/* Scheduled Visit */}
            {patient.scheduled_visit && (
              <div className="p-6 mb-6 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Next Scheduled Visit</span>
                  </div>
                  <CountdownTimer 
                    targetDate={patient.scheduled_visit}
                    onExpire={() => setCanJoinCall(true)}
                  />
                </div>
                <p className="text-xl font-semibold tracking-tight">
                  {formatDate(patient.scheduled_visit)}
                </p>
              </div>
            )}

            {/* Join Call Button */}
            <Button
              onClick={handleJoinCall}
              disabled={!canJoinCall && !patient.call_active}
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 rounded-xl btn-premium"
            >
              <Video className="w-6 h-6 mr-3" />
              {patient.call_active ? 'Join Active Call' : canJoinCall ? 'Join Video Call' : 'Waiting for Visit Time'}
            </Button>

            {!canJoinCall && !patient.call_active && patient.scheduled_visit && (
              <p className="text-center text-sm text-muted-foreground mt-4 font-medium">
                You can join 5 minutes before the scheduled time
              </p>
            )}
          </div>
        </div>

        {/* Notes from Nurse */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Notes from Care Team</h3>
            </div>
          </div>
          <div className="p-8">
            {patient.notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No notes available yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-4">
                  {patient.notes.map((note, index) => (
                    <div
                      key={note.id}
                      className="p-5 rounded-xl bg-muted/20 border border-border/20 transition-all duration-300 hover:bg-muted/30 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm leading-relaxed mb-4">{note.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-2 font-medium">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          {note.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatNoteDate(note.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={fetchPatient}
          className="w-full h-14 gap-3 glass-card border-0 rounded-xl hover:bg-primary/10 transition-all duration-300 font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Information
        </Button>
      </main>
    </div>
  );
}
