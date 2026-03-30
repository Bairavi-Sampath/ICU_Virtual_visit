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
  const roomNameFromQuery = searchParams.get('room') || '';
  const patientId = searchParams.get('patientId') || '';
  
  const [copied, setCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to Talky.io meeting URL after brief delay
  // Talky.io opens instantly - no moderator wait, no login required!
  useEffect(() => {
    if (callLink) {
      const timeout = setTimeout(() => {
        window.location.href = callLink;
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [callLink]);

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
      showToast('Call link copied!', 'success');
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
    setIsRedirecting(false);
  };

  // No call link available
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
            <p className="text-muted-foreground mb-8">No video call available at this time.</p>
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

  // Redirecting to Talky.io - instant video call without moderator requirements
  if (isRedirecting) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full rounded-2xl overflow-hidden animate-scale-in">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Opening Video Call</h2>
            <p className="text-muted-foreground mb-2">Redirecting to Talky.io...</p>
            <p className="text-sm text-muted-foreground mb-8">Will open in new tab - no login required!</p>
            <Button 
              onClick={handleOpenInNewTab}
              className="h-12 px-6 rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-medium gap-2 w-full"
            >
              <ExternalLink className="w-4 h-4" />
              Open Call Link
            </Button>
            <p className="text-xs text-muted-foreground mt-4">If nothing happens, click the button</p>
          </div>
        </div>
      </div>
    );
  }

  // Main call interface
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Video Container */}
        <div className="relative w-full h-full min-h-[60vh] rounded-2xl overflow-hidden glass-card border-0 shadow-2xl shadow-primary/10 animate-scale-in flex items-center justify-center">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent pointer-events-none" />
          
          <div className="text-center px-6 z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Video Call in Progress</h2>
            <p className="text-muted-foreground mb-6">Talky.io has been opened in a new tab</p>
            <Button 
              onClick={handleOpenInNewTab}
              className="h-12 px-8 rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 font-medium gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Call in New Tab
            </Button>
          </div>
        </div>

        {/* Talky.io Info Alert */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up border border-blue-500/20 bg-blue-500/5">
          <div className="flex gap-4">
            <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center pt-1">
              <span className="text-blue-600 font-bold text-sm">ℹ</span>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Talky.io - Simple Video Conferencing
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>✓ <strong>No Account Needed</strong> - Completely free, instant access</li>
                <li>✓ <strong>No Moderator Required</strong> - Both users join immediately</li>
                <li>✓ <strong>Allow Camera & Microphone</strong> - Browser will ask for permissions</li>
                <li>✓ <strong>Same Room ID</strong> - Both users automatically in same meeting</li>
                <li>✓ <strong>High Quality Audio/Video</strong> - Crystal clear communication</li>
                <li>✓ <strong>Screen Sharing</strong> - Available if needed for patient education</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call Info Card */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Share this link</h3>
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

        {/* Tips Card */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-lg">Tips for a better call</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Ensure good lighting and stable internet',
              'Use headphones to reduce echo',
              'Speak clearly and face camera',
              'Keep background noise minimal'
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
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    }>
      <VideoCallContent />
    </Suspense>
  );
}
