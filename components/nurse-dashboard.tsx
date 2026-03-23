'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Header } from '@/components/header';
import { PatientCard } from '@/components/patient-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/toast-provider';
import { getPatients, startCall, type Patient } from '@/lib/api';

export function NurseDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      showToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleStartCall = async (patientId: string) => {
    try {
      const callData = await startCall(patientId);
      showToast('Video call started successfully!', 'success');
      // Navigate to video call page with call data
      router.push(`/call?link=${encodeURIComponent(callData.call_link)}&room=${callData.room_name}&patientId=${patientId}`);
    } catch (error) {
      console.error('Failed to start call:', error);
      showToast('Failed to start video call', 'error');
    }
  };

  const handleRefresh = () => {
    fetchPatients(true);
    showToast('Patient list refreshed', 'info');
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: patients.length,
    stable: patients.filter(p => p.status === 'stable').length,
    recovering: patients.filter(p => p.status === 'recovering').length,
    critical: patients.filter(p => p.status === 'critical').length,
    activeCalls: patients.filter(p => p.call_active).length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Nurse Dashboard" />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.stable}</p>
                <p className="text-xs text-muted-foreground">Stable</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.recovering}</p>
                <p className="text-xs text-muted-foreground">Recovering</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse-soft" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCalls}</p>
                <p className="text-xs text-muted-foreground">Active Calls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-12 gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Patient Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full mb-4 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No patients are currently in the system'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onStartCall={handleStartCall}
                onRefresh={() => fetchPatients(true)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
