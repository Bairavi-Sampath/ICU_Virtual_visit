'use client';

import { useState } from 'react';
import { Video, Calendar, FileText, Phone, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        patient.call_active && "ring-2 ring-emerald-500 ring-offset-2"
      )}>
        {/* Call Active Indicator */}
        {patient.call_active && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse-soft" />
        )}

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {patient.name}
              </h3>
              <p className="text-sm text-muted-foreground">Room {patient.room_number}</p>
            </div>
            
            {/* Status Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                  disabled={statusLoading}
                >
                  <StatusBadge status={patient.status} />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => handleStatusChange('stable')}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  Stable
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('recovering')}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  Recovering
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('critical')}>
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Critical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Call Active Indicator */}
          {patient.call_active && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse-soft" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Call Active
              </span>
            </div>
          )}

          {/* Scheduled Visit */}
          {patient.scheduled_visit && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Next Visit</span>
              </div>
              <CountdownTimer targetDate={patient.scheduled_visit} />
            </div>
          )}

          {/* Notes Preview */}
          {patient.notes.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {patient.notes[0].content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {patient.notes.length} note{patient.notes.length !== 1 && 's'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onStartCall(patient.id)}
              size="lg"
              className="flex-1 min-w-[120px] h-12 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30"
            >
              <Video className="w-4 h-4 mr-2" />
              {patient.call_active ? 'Join Call' : 'Start Call'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setScheduleOpen(true)}
              className="flex-1 min-w-[120px] h-12 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setNotesOpen(true)}
              className="flex-1 min-w-[120px] h-12 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              Notes
            </Button>
          </div>
        </CardContent>
      </Card>

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
