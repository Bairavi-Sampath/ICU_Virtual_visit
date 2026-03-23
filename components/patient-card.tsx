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
        "group relative glass-card hover-lift rounded-2xl overflow-hidden transition-all duration-300",
        patient.call_active && "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-background",
        isCritical && "animate-pulse-critical"
      )}>
        {/* Top Border Gradient */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
          patient.call_active 
            ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" 
            : isCritical
            ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400"
            : "bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100"
        )} />

        {/* Live Call Indicator */}
        {patient.call_active && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Live</span>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {patient.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Room {patient.room_number}
              </p>
            </div>
            
            {/* Status Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full"
                  disabled={statusLoading}
                >
                  <StatusBadge status={patient.status} />
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 glass border-border/50">
                <DropdownMenuItem onClick={() => handleStatusChange('stable')} className="gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                  Stable
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('recovering')} className="gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30" />
                  Recovering
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('critical')} className="gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                  Critical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Call Active Banner */}
          {patient.call_active && (
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Call in Progress
                </span>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  Family is connected
                </p>
              </div>
            </div>
          )}

          {/* Scheduled Visit */}
          {patient.scheduled_visit && !patient.call_active && (
            <div className="flex items-center justify-between mb-5 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Next Visit</span>
              </div>
              <CountdownTimer targetDate={patient.scheduled_visit} />
            </div>
          )}

          {/* Notes Preview */}
          {patient.notes.length > 0 && (
            <div className="mb-5 p-4 rounded-xl bg-muted/30 border border-border/20">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {patient.notes[0].content}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                {patient.notes.length} note{patient.notes.length !== 1 && 's'} available
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onStartCall(patient.id)}
              size="lg"
              className={cn(
                "flex-1 min-w-[100px] h-13 btn-premium rounded-xl font-medium",
                patient.call_active 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25" 
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              )}
            >
              <Video className="w-4 h-4 mr-2" />
              {patient.call_active ? 'Join' : 'Call'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setScheduleOpen(true)}
              className="flex-1 min-w-[100px] h-13 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setNotesOpen(true)}
              className="flex-1 min-w-[100px] h-13 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium"
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
