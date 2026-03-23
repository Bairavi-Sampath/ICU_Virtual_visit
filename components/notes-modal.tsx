'use client';

import { useState } from 'react';
import { FileText, Send, X, User, Clock, MessageSquare } from 'lucide-react';
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
      <DialogContent className="sm:max-w-lg glass-card border-0 rounded-2xl animate-scale-in overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-md shadow-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Patient Notes
          </DialogTitle>
          <DialogDescription className="text-base">
            Notes for <span className="font-semibold text-foreground">{patient.name}</span> - Room {patient.room_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a note for the family..."
              className="min-h-[120px] resize-none text-base rounded-xl border-border/50 bg-card/50 focus:border-primary/50 focus:bg-card transition-all duration-300 p-4"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="h-12 px-6 rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-medium"
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

        <div className="border-t border-border/30 pt-5 mt-3">
          <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Previous Notes ({notes.length})
          </h4>
          
          {notes.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add your first note above</p>
            </div>
          ) : (
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/20 hover:border-border/40 transition-all duration-300 animate-slide-up"
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
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-12 px-6 rounded-xl border-border/50 hover:bg-muted/50 font-medium"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
