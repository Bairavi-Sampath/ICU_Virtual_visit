'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Copy, Check, PhoneOff, ArrowLeft, Video, ExternalLink, Lightbulb, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast-provider';
import { endCall } from '@/lib/api';
import { cn } from '@/lib/utils';

function VideoCallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const callLink = searchParams.get('link') || '';
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
      <div className="min-h-screen gradient-bg pattern-dots flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full rounded-2xl overflow-hidden animate-scale-in">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Video className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Active Call</h2>
            <p className="text-muted-foreground mb-8">There is no video call to join at this time.</p>
            <Button 
              onClick={() => router.push('/')} 
              className="h-14 px-8 rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-medium text-base gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
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
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="w-12 h-12 rounded-xl hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Virtual Visit</h1>
                <div className="flex items-center gap-3 text-sm">
                  {/* Live indicator with blinking dot */}
                  <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wide">Live</span>
                  </span>
                  <span className="font-mono text-muted-foreground font-medium">{formatDuration(callDuration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className={cn(
                "h-12 gap-2 hidden sm:flex rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 font-medium transition-all duration-300",
                copied && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndCall}
              className="h-12 gap-2 rounded-xl shadow-lg shadow-destructive/20 font-medium px-5"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Call</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Video Container */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <div className="relative w-full h-full min-h-[60vh] rounded-2xl overflow-hidden glass-card border-0 shadow-2xl shadow-primary/10 animate-scale-in">
          {/* Decorative corner gradients */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent pointer-events-none" />
          
          {/* Jitsi iframe */}
          <iframe
            src={callLink}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        {/* Call Info Card */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Share this link with family members</h3>
              <p className="text-sm text-muted-foreground break-all font-mono bg-muted/30 px-4 py-2 rounded-lg">{callLink}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className={cn(
                  "h-12 gap-2 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 font-medium transition-all duration-300",
                  copied && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenInNewTab}
                className="h-12 gap-2 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-lg">Tips for a better call</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Ensure good lighting and a stable internet connection',
              'Use headphones to reduce echo',
              'Speak clearly and face the camera',
              'Keep background noise to a minimum'
            ].map((tip, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
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
