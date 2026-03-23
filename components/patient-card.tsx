'use client';

import { useState } from 'react';
import { Video, Calendar, FileText, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/status-badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { ScheduleModal } from '@/components/schedule-modal';
import { NotesModal } from '@/components/notes-modal';
import { updatePatientStatus, type Patient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  onStartCall: (patientId: string) => void;
  onRefresh: () => void;
}

export function PatientCard({ patient, onStartCall, onRefresh }: PatientCardProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusChange = async (newStatus: Patient['status']) => {
    setStatusLoading(true);
    try {
      await updatePatientStatus(patient.id, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const isCritical = patient.status === 'critical';

  return (
    <>
      <div className={cn(
        "glass-card relative overflow-hidden rounded-2xl transition-all duration-300",
        isCritical && "animate-pulse-critical",
        patient.call_active && "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-background"
      )}>
        {/* Top accent bar */}
        <div className={cn(
          "h-1 w-full",
          patient.status === 'stable' && "bg-gradient-to-r from-emerald-400 to-emerald-500",
          patient.status === 'recovering' && "bg-gradient-to-r from-amber-400 to-amber-500",
          patient.status === 'critical' && "bg-gradient-to-r from-red-400 to-red-500"
        )} />

        {/* Call Active Indicator */}
        {patient.call_active && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-blink" />
              LIVE
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1 tracking-tight">
                {patient.name}
              </h3>
              <p className="text-sm text-muted-foreground">Room {patient.room_number}</p>
            </div>
            
            {/* Status Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                  disabled={statusLoading}
                >
                  <StatusBadge status={patient.status} />
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 glass border-border/50">
                <DropdownMenuItem onClick={() => handleStatusChange('stable')} className="gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Stable
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('recovering')} className="gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Recovering
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('critical')} className="gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Critical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Call Active Banner */}
          {patient.call_active && (
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="relative">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-blink" />
              </div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Video call in progress
              </span>
            </div>
          )}

          {/* Scheduled Visit */}
          {patient.scheduled_visit && (
            <div className="flex items-center justify-between mb-5 p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Next Visit</span>
              </div>
              <CountdownTimer targetDate={patient.scheduled_visit} />
            </div>
          )}

          {/* Notes Preview */}
          {patient.notes.length > 0 && (
            <div className="mb-5 p-4 rounded-xl bg-muted/20 border border-border/20">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {patient.notes[0].content}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                {patient.notes.length} note{patient.notes.length !== 1 && 's'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onStartCall(patient.id)}
              size="lg"
              className="flex-1 min-w-[100px] h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl btn-premium"
            >
              <Video className="w-4 h-4 mr-2" />
              {patient.call_active ? 'Join' : 'Call'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setScheduleOpen(true)}
              className="flex-1 min-w-[100px] h-12 rounded-xl border-border/50 hover:bg-accent/50 hover:border-accent transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setNotesOpen(true)}
              className="flex-1 min-w-[100px] h-12 rounded-xl border-border/50 hover:bg-accent/50 hover:border-accent transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Notes
            </Button>
          </div>
        </div>
      </div>

      <ScheduleModal
        patient={patient}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSuccess={onRefresh}
      />

      <NotesModal
        patient={patient}
        open={notesOpen}
        onOpenChange={setNotesOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
