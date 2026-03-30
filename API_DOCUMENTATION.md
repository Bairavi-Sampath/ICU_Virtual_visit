# API Documentation

## Endpoints Overview

All endpoints are documented in the interactive Swagger UI at: **`http://localhost:3000/docs/swagger`**

---

## Base URL
```
http://localhost:3000
```

---

## Patients Endpoints

### Get All Patients
```
GET /api/patients
```
**Response:**
```json
[
  {
    "id": "1",
    "name": "John Smith",
    "room_number": "ICU-101",
    "status": "stable",
    "scheduled_visit": "2026-03-28T15:00:00.000Z",
    "call_active": false,
    "notes": []
  }
]
```

### Get Patient by ID
```
GET /api/patients/{patientId}
```

---

## Video Calls Endpoints

### Start/Join Call
```
POST /api/patients/{patientId}/call
```
**Response:**
```json
{
  "call_link": "https://talky.io/icu-visit-1",
  "room_name": "icu-visit-1",
  "visit_id": "abc123"
}
```

### End Call
```
DELETE /api/patients/{patientId}/call
```
**Response:**
```json
{
  "success": true,
  "message": "Call ended successfully"
}
```

---

## Schedule Endpoints

### Schedule Visit
```
POST /api/patients/{patientId}/schedule
```
**Request Body:**
```json
{
  "date": "2026-03-28",
  "time": "15:30",
  "duration": 30
}
```

---

## Notes Endpoints

### Get Patient Notes
```
GET /api/patients/{patientId}/notes
```

### Add Note
```
POST /api/patients/{patientId}/notes
```
**Request Body:**
```json
{
  "content": "Patient is responding well to treatment"
}
```

---

## Database Endpoints

### Test Connection
```
GET /api/db/ping
```
**Response:**
```json
{
  "ok": true,
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## Key Features

✅ **Auto-Complete Ended Calls** - Calls automatically marked as completed after scheduled_end time
✅ **Real-time Status** - Live patient and call status updates
✅ **Instant Video** - Talky.io integration for instant calls
✅ **Secure** - Role-based authentication for nurses, families, and staff
