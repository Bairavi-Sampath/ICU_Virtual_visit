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
      
      // Check if can join call (within 5 minutes of scheduled time or call is active)
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
    
    // Refresh every 30 seconds
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
      <div className="min-h-screen bg-background">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Family Portal" />
        <main className="container mx-auto px-4 py-8 max-w-2xl text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground">Unable to load patient information.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Family Portal" />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Patient Info Card */}
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-accent" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-muted-foreground">Room {patient.room_number}</p>
                </div>
              </div>
              <StatusBadge status={patient.status} size="lg" />
            </div>

            {/* Call Active Banner */}
            {patient.call_active && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-pulse-soft">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  Video call is active - Join now!
                </span>
              </div>
            )}

            {/* Scheduled Visit */}
            {patient.scheduled_visit && (
              <div className="p-5 mb-6 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Next Scheduled Visit</span>
                  </div>
                  <CountdownTimer 
                    targetDate={patient.scheduled_visit}
                    onExpire={() => setCanJoinCall(true)}
                  />
                </div>
                <p className="text-lg font-semibold">
                  {formatDate(patient.scheduled_visit)}
                </p>
              </div>
            )}

            {/* Join Call Button */}
            <Button
              onClick={handleJoinCall}
              disabled={!canJoinCall && !patient.call_active}
              size="lg"
              className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50"
            >
              <Video className="w-5 h-5 mr-2" />
              {patient.call_active ? 'Join Active Call' : canJoinCall ? 'Join Video Call' : 'Waiting for Visit Time'}
            </Button>

            {!canJoinCall && !patient.call_active && patient.scheduled_visit && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                You can join 5 minutes before the scheduled time
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes from Nurse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Notes from Care Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No notes available yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {patient.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <p className="text-sm leading-relaxed mb-3">{note.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
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
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={fetchPatient}
          className="w-full h-12 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Information
        </Button>
      </main>
    </div>
  );
}
