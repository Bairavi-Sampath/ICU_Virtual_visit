'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Copy, Check, PhoneOff, ArrowLeft, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Active Call</h2>
            <p className="text-muted-foreground mb-6">There is no video call to join at this time.</p>
            <Button onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Video Call</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
                <span className="mx-1">•</span>
                <span className="font-mono">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="gap-2 hidden sm:flex"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndCall}
              className="gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Call</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Video Container */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="relative w-full h-full min-h-[60vh] rounded-2xl overflow-hidden bg-muted/30 border border-border shadow-lg">
          {/* Jitsi iframe */}
          <iframe
            src={callLink}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        {/* Call Info Card */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Share this link with family members</h3>
                <p className="text-sm text-muted-foreground break-all">{callLink}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenInNewTab}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
          <h4 className="font-medium mb-2">Tips for a better call</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure good lighting and a stable internet connection</li>
            <li>• Use headphones to reduce echo</li>
            <li>• Speak clearly and face the camera</li>
            <li>• Keep background noise to a minimum</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading video call...</p>
        </div>
      </div>
    }>
      <VideoCallContent />
    </Suspense>
  );
}
