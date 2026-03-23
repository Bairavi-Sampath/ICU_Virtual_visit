'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Copy, Check, PhoneOff, ArrowLeft, Video, ExternalLink, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast-provider';
import { endCall } from '@/lib/api';

function VideoCallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const callLink = searchParams.get('link') || '';
  const roomName = searchParams.get('room') || '';
  const patientId = searchParams.get('patientId') || '';
  
  const [copied, setCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(callLink);
      setCopied(true);
      showToast('Call link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleEndCall = async () => {
    if (patientId) {
      await endCall(patientId);
    }
    showToast('Call ended', 'info');
    router.push('/');
  };

  const handleOpenInNewTab = () => {
    window.open(callLink, '_blank');
  };

  if (!callLink) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-accent" />
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
              <Video className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Active Call</h2>
            <p className="text-muted-foreground mb-8">There is no video call to join at this time.</p>
            <Button 
              onClick={() => router.push('/')} 
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-semibold btn-premium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b-0 shadow-sm">
        <div className="container mx-auto px-4 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-11 w-11 rounded-xl hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Video Call</h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-blink" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-50" />
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono font-medium">{formatDuration(callDuration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="gap-2 hidden sm:flex h-11 rounded-xl border-border/50 font-medium"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              onClick={handleEndCall}
              className="gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 font-semibold"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Call</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Video Container */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <div className="relative w-full h-full min-h-[60vh] rounded-2xl overflow-hidden glass-card border-0 shadow-2xl shadow-primary/10">
          {/* Jitsi iframe */}
          <iframe
            src={callLink}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        {/* Call Info Card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/50 via-primary/30 to-accent/30" />
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Share this link with family members</h3>
                </div>
                <p className="text-sm text-muted-foreground break-all font-mono bg-muted/30 px-3 py-2 rounded-lg">{callLink}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2 h-12 rounded-xl border-border/50 font-medium"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenInNewTab}
                  className="gap-2 h-12 rounded-xl border-border/50 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 rounded-2xl bg-muted/20 border border-border/30">
          <h4 className="font-semibold mb-3">Tips for a better call</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Ensure good lighting and a stable internet connection
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Use headphones to reduce echo
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Speak clearly and face the camera
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Keep background noise to a minimum
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Loading video call...</p>
        </div>
      </div>
    }>
      <VideoCallContent />
    </Suspense>
  );
}
