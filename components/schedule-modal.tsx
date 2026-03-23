'use client';

import { useState } from 'react';
import { Calendar, Clock, X, Sparkles } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-0 rounded-2xl animate-scale-in overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-md shadow-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Schedule Visit
          </DialogTitle>
          <DialogDescription className="text-base">
            Schedule a virtual visit for <span className="font-semibold text-foreground">{patient.name}</span> in Room {patient.room_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
                className="pl-12 h-14 text-base rounded-xl border-border/50 bg-card/50 focus:border-primary/50 focus:bg-card transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center pointer-events-none">
                <Calendar className="w-4 h-4 text-muted-foreground" />
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
                className="pl-12 h-14 text-base rounded-xl border-border/50 bg-card/50 focus:border-primary/50 focus:bg-card transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center pointer-events-none">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-semibold">
              Duration
            </Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex h-14 w-full rounded-xl border border-border/50 bg-card/50 px-4 py-2 text-base ring-offset-background focus:border-primary/50 focus:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-xl border-border/50 hover:bg-muted/50 font-medium text-base"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-medium text-base"
            >
              {loading ? (
                <>
                  <Spinner className="w-5 h-5 mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
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
