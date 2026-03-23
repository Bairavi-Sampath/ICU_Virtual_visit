const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Patient {
  id: string;
  name: string;
  room_number: string;
  status: 'stable' | 'recovering' | 'critical';
  scheduled_visit?: string;
  notes: Note[];
  call_active?: boolean;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  author: string;
}

export interface ScheduleVisitData {
  date: string;
  time: string;
  duration: number;
}

export interface CallData {
  call_link: string;
  room_name: string;
}

// Mock data for development
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    room_number: 'ICU-101',
    status: 'stable',
    scheduled_visit: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: '1', content: 'Patient is responding well to treatment.', created_at: new Date().toISOString(), author: 'Nurse Sarah' },
      { id: '2', content: 'Vitals stable throughout the night.', created_at: new Date(Date.now() - 3600000).toISOString(), author: 'Nurse Mike' }
    ],
    call_active: false
  },
  {
    id: '2',
    name: 'Mary Johnson',
    room_number: 'ICU-102',
    status: 'recovering',
    scheduled_visit: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: '3', content: 'Recovery progressing as expected.', created_at: new Date().toISOString(), author: 'Dr. Williams' }
    ],
    call_active: false
  },
  {
    id: '3',
    name: 'Robert Davis',
    room_number: 'ICU-103',
    status: 'critical',
    scheduled_visit: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: '4', content: 'Requires close monitoring. Family has been notified.', created_at: new Date().toISOString(), author: 'Nurse Sarah' }
    ],
    call_active: true
  },
  {
    id: '4',
    name: 'Emily Chen',
    room_number: 'ICU-104',
    status: 'stable',
    notes: [],
    call_active: false
  },
  {
    id: '5',
    name: 'Michael Brown',
    room_number: 'ICU-105',
    status: 'recovering',
    scheduled_visit: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: '5', content: 'Physical therapy started today.', created_at: new Date().toISOString(), author: 'Nurse Lisa' }
    ],
    call_active: false
  }
];

let patients = [...mockPatients];

// API Functions
export async function getPatients(): Promise<Patient[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`);
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
  } catch {
    // Return mock data in development
    return patients;
  }
}

export async function getPatientStatus(patientId: string): Promise<Patient> {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch patient status');
    return response.json();
  } catch {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) throw new Error('Patient not found');
    return patient;
  }
}

export async function startCall(patientId: string): Promise<CallData> {
  try {
    const response = await fetch(`${API_BASE_URL}/start-call/${patientId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start call');
    return response.json();
  } catch {
    // Return mock call data
    const roomName = `icu-visit-${patientId}-${Date.now()}`;
    patients = patients.map(p => 
      p.id === patientId ? { ...p, call_active: true } : p
    );
    return {
      call_link: `https://meet.jit.si/${roomName}`,
      room_name: roomName
    };
  }
}

export async function scheduleVisit(patientId: string, data: ScheduleVisitData): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${patientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to schedule visit');
    return response.json();
  } catch {
    // Update mock data
    const scheduledTime = new Date(`${data.date}T${data.time}`).toISOString();
    patients = patients.map(p => 
      p.id === patientId ? { ...p, scheduled_visit: scheduledTime } : p
    );
    return { success: true };
  }
}

export async function addNote(patientId: string, content: string): Promise<Note> {
  try {
    const response = await fetch(`${API_BASE_URL}/add-note/${patientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add note');
    return response.json();
  } catch {
    // Add to mock data
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      created_at: new Date().toISOString(),
      author: 'Current Nurse'
    };
    patients = patients.map(p => 
      p.id === patientId ? { ...p, notes: [newNote, ...p.notes] } : p
    );
    return newNote;
  }
}

export async function updatePatientStatus(patientId: string, status: Patient['status']): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  } catch {
    patients = patients.map(p => 
      p.id === patientId ? { ...p, status } : p
    );
    return { success: true };
  }
}

export async function endCall(patientId: string): Promise<{ success: boolean }> {
  patients = patients.map(p => 
    p.id === patientId ? { ...p, call_active: false } : p
  );
  return { success: true };
}
