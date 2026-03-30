'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, Users, AlertCircle, CheckCircle, Clock, Activity, Plus } from 'lucide-react';
import { Header } from '@/components/header';
import { PatientCard } from '@/components/patient-card';
import { AddPatientModal } from '@/components/add-patient-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/toast-provider';
import { getPatients, startCall, type Patient } from '@/lib/api';
import { cn } from '@/lib/utils';

export function NurseDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);

  const fetchPatients = useCallback(async (isRefresh = false) => {
    // Only show loading state on initial load, not on background refreshes
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      // Only show toast on manual refresh, not on background refresh
      if (isRefresh) {
        showToast('Failed to load patients', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPatients();
    // Auto-refresh every 10 seconds to detect call status changes (silent background refresh)
    const interval = setInterval(() => {
      fetchPatients(true); // Pass true to indicate background refresh (no visual loader)
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchPatients]);

  const handleStartCall = async (patientId: string) => {
    try {
      const callData = await startCall(patientId);
      showToast('Video call started successfully!', 'success');
      router.push(`/call?link=${encodeURIComponent(callData.call_link)}&room=${callData.room_name}&patientId=${patientId}&name=${encodeURIComponent('Nurse')}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to start call - Full error:', error);
      console.error('Error message:', errorMessage);
      showToast(`Failed to start video call: ${errorMessage}`, 'error');
    }
  };

  const handleRefresh = () => {
    fetchPatients(true);
    showToast('Patient list refreshed', 'info');
  };

  // Separate active and archived patients
  const activePatients = patients.filter(
    patient => patient.status !== 'recovered' && patient.status !== 'discharged'
  );

  const archivedPatients = patients.filter(
    patient => patient.status === 'recovered' || patient.status === 'discharged'
  );

  const filteredActivePatients = activePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchivedPatients = archivedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: activePatients.length,
    stable: activePatients.filter(p => p.status === 'stable').length,
    recovering: activePatients.filter(p => p.status === 'recovering').length,
    critical: activePatients.filter(p => p.status === 'critical').length,
    activeCalls: activePatients.filter(p => p.call_active).length
  };

  return (
    <div className="min-h-screen gradient-bg pattern-dots">
      <Header title="Nurse Dashboard" />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total Patients */}
          <div className="glass-card hover-lift rounded-2xl p-5 animate-slide-up stagger-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Patients</p>
              </div>
            </div>
          </div>
          
          {/* Stable */}
          <div className="glass-card hover-lift rounded-2xl p-5 animate-slide-up stagger-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.stable}</p>
                <p className="text-sm text-muted-foreground font-medium">Stable</p>
              </div>
            </div>
          </div>
          
          {/* Recovering */}
          <div className="glass-card hover-lift rounded-2xl p-5 animate-slide-up stagger-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.recovering}</p>
                <p className="text-sm text-muted-foreground font-medium">Recovering</p>
              </div>
            </div>
          </div>
          
          {/* Critical */}
          <div className={cn(
            "glass-card hover-lift rounded-2xl p-5 animate-slide-up stagger-4",
            stats.critical > 0 && "animate-pulse-critical"
          )}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shadow-lg shadow-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{stats.critical}</p>
                <p className="text-sm text-muted-foreground font-medium">Critical</p>
              </div>
            </div>
          </div>
          
          {/* Active Calls */}
          <div className="glass-card hover-lift rounded-2xl p-5 col-span-2 md:col-span-1 animate-slide-up stagger-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10 relative">
                <Activity className="w-6 h-6 text-primary" />
                {stats.activeCalls > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-blink-live shadow-lg shadow-emerald-500/50" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold tracking-tight">{stats.activeCalls}</p>
                  {stats.activeCalls > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
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
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-slide-up stagger-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base glass-card border-0 rounded-xl shadow-sm focus:shadow-md transition-shadow"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setAddPatientModalOpen(true)}
              className="h-14 px-6 gap-2 flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 rounded-xl font-medium transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-14 px-6 gap-3 flex-1 sm:flex-none glass-card border-0 rounded-xl hover:bg-primary/5 transition-all duration-300"
            >
              <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
              <span className="font-medium">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Patient Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-shimmer">
                <div className="flex items-start justify-between mb-5">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-36 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-lg" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full mb-5 rounded-xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-14 flex-1 rounded-xl" />
                  <Skeleton className="h-14 flex-1 rounded-xl" />
                  <Skeleton className="h-14 flex-1 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivePatients.length === 0 && filteredArchivedPatients.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No patients found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search query' : 'No patients are currently in the system'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Patients Section */}
            {filteredActivePatients.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                  Active Patients
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivePatients.map((patient, index) => (
                    <div 
                      key={patient.id} 
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <PatientCard
                        patient={patient}
                        onStartCall={handleStartCall}
                        onRefresh={() => fetchPatients(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archived Patients Section */}
            {filteredArchivedPatients.length > 0 && (
              <div className="opacity-60">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-muted-foreground">
                  <div className="w-1 h-8 bg-gradient-to-b from-muted-foreground to-muted-foreground/50 rounded-full" />
                  Archived Patients
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArchivedPatients.map((patient, index) => (
                    <div 
                      key={patient.id} 
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <PatientCard
                        patient={patient}
                        onStartCall={handleStartCall}
                        onRefresh={() => fetchPatients(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Patient Modal */}
        <AddPatientModal
          open={addPatientModalOpen}
          onOpenChange={setAddPatientModalOpen}
          onSuccess={() => {
            setAddPatientModalOpen(false);
            fetchPatients(true);
          }}
        />
      </main>
    </div>
  );
}
