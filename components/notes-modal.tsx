'use client';

import { useState } from 'react';
import { FileText, Send, X, User, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addNote, type Patient, type Note } from '@/lib/api';

interface NotesModalProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NotesModal({ patient, open, onOpenChange, onSuccess }: NotesModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>(patient.notes || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);
    try {
      const newNote = await addNote(patient.id, content);
      setNotes([newNote, ...notes]);
      setContent('');
      onSuccess();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card border-0 rounded-2xl shadow-2xl shadow-primary/10 animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-accent rounded-t-2xl -mt-6 -mx-6 mb-2" />
        
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Patient Notes
          </DialogTitle>
          <DialogDescription className="text-base">
            Notes for <span className="font-semibold text-foreground">{patient.name}</span> - Room {patient.room_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a new note..."
              className="min-h-[120px] resize-none rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all duration-300 text-base"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              size="lg"
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-semibold btn-premium"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-border/30 pt-5 mt-2">
          <h4 className="text-sm font-semibold text-muted-foreground mb-4">Previous Notes</h4>
          
          {notes.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
                <FileText className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No notes yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                {notes.map((note, index) => (
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
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-12 px-6 rounded-xl border-border/50 font-semibold"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
