'use client';

import { useState } from 'react';
import { X, Plus, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/toast-provider';

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPatientModal({
  open,
  onOpenChange,
  onSuccess,
}: AddPatientModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    roomNumber: '',
    status: 'stable' as 'stable' | 'recovering' | 'critical',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Patient name is required');
      return false;
    }
    if (!formData.roomNumber.trim()) {
      setError('Room number is required');
      return false;
    }
    if (!formData.status) {
      setError('Status is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    console.log('📤 Submitting form data:', formData);
    try {
      const response = await fetch('/api/patients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Server response:', { status: response.status, data });

      if (!response.ok) {
        setError(data.message || 'Failed to add patient');
        showToast(data.message || 'Failed to add patient', 'error');
        return;
      }

      showToast(
        `Patient "${formData.fullName}" added successfully!`,
        'success'
      );
      setFormData({
        fullName: '',
        roomNumber: '',
        status: 'stable',
      });
      setError('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      console.error('🚨 Fetch error:', error);
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Patient
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Patient Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Patient Name *
            </label>
            <Input
              type="text"
              name="fullName"
              placeholder="e.g., Ahmed Ali"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={loading}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Room Number *
            </label>
            <Input
              type="text"
              name="roomNumber"
              placeholder="e.g., ICU-104"
              value={formData.roomNumber}
              onChange={handleInputChange}
              disabled={loading}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Initial Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="stable">✅ Stable</option>
              <option value="recovering">⏳ Recovering</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>

          <p className="text-xs text-muted-foreground">
            * All fields are required
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
