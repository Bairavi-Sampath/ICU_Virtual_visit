'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, Users, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
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

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: patients.length,
    stable: patients.filter(p => p.status === 'stable').length,
    recovering: patients.filter(p => p.status === 'recovering').length,
    critical: patients.filter(p => p.status === 'critical').length,
    activeCalls: patients.filter(p => p.call_active).length
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header title="Nurse Dashboard" />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total Patients */}
          <div className="stats-card glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Patients</p>
              </div>
            </div>
          </div>
          
          {/* Stable */}
          <div className="stats-card glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.stable}</p>
                <p className="text-sm text-muted-foreground font-medium">Stable</p>
              </div>
            </div>
          </div>
          
          {/* Recovering */}
          <div className="stats-card glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.recovering}</p>
                <p className="text-sm text-muted-foreground font-medium">Recovering</p>
              </div>
            </div>
          </div>
          
          {/* Critical */}
          <div className="stats-card glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shadow-sm animate-pulse-soft">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{stats.critical}</p>
                <p className="text-sm text-muted-foreground font-medium">Critical</p>
              </div>
            </div>
          </div>
          
          {/* Active Calls */}
          <div className="stats-card glass-card p-5 rounded-2xl col-span-2 md:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-sm relative">
                <Activity className="w-6 h-6 text-primary" />
                {stats.activeCalls > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 live-indicator" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold tracking-tight">{stats.activeCalls}</p>
                  {stats.activeCalls > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full animate-pulse-soft">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Active Calls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base glass-card border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-14 px-6 gap-2 w-full sm:w-auto glass-card border-0 rounded-xl hover:bg-primary/10 transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Patient Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full mb-4 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No patients are currently in the system'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <div 
                key={patient.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PatientCard
                  patient={patient}
                  onStartCall={handleStartCall}
                  onRefresh={() => fetchPatients(true)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
