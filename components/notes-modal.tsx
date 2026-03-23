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
      <DialogContent className="sm:max-w-lg glass animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Patient Notes
          </DialogTitle>
          <DialogDescription>
            Notes for <span className="font-medium text-foreground">{patient.name}</span> - Room {patient.room_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a new note..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-border pt-4 mt-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Previous Notes</h4>
          
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border/50 animate-slide-up"
                  >
                    <p className="text-sm leading-relaxed mb-3">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
