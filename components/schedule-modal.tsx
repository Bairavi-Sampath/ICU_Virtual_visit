'use client';

import { useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { scheduleVisit, type Patient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ScheduleModalProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ScheduleModal({ patient, open, onOpenChange, onSuccess }: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      await scheduleVisit(patient.id, {
        date,
        time,
        duration: parseInt(duration)
      });
      onSuccess();
      onOpenChange(false);
      setDate('');
      setTime('');
      setDuration('30');
    } catch {
      setError('Failed to schedule visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const durations = [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '60 min' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-0 rounded-2xl shadow-2xl shadow-primary/10 animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-accent rounded-t-2xl -mt-6 -mx-6 mb-2" />
        
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Schedule Visit
          </DialogTitle>
          <DialogDescription className="text-base">
            Schedule a virtual visit for <span className="font-semibold text-foreground">{patient.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold">
              Date
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="pl-12 h-14 text-base rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-semibold">
              Time
            </Label>
            <div className="relative">
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-12 h-14 text-base rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Duration
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    "h-12 rounded-xl font-semibold text-sm transition-all duration-300 border-2",
                    duration === d.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium animate-slide-up">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-xl border-border/50 font-semibold"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-semibold btn-premium"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
