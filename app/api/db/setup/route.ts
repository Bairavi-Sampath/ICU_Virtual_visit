import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

async function createSchema() {
  const sql = getSql();

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS staff_users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'nurse',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS family_users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      relationship_to_patient TEXT,
      phone_number TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      medical_record_number TEXT,
      full_name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'stable',
      admitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS family_patient_access (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      family_user_id BIGINT NOT NULL REFERENCES family_users(id) ON DELETE CASCADE,
      patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      can_view_notes BOOLEAN NOT NULL DEFAULT TRUE,
      can_schedule_visit BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (family_user_id, patient_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS visits (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      family_user_id BIGINT NOT NULL REFERENCES family_users(id) ON DELETE CASCADE,
      scheduled_start TIMESTAMPTZ NOT NULL,
      scheduled_end TIMESTAMPTZ,
      call_link TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_by_staff_id BIGINT REFERENCES staff_users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS patient_notes (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      author_staff_id BIGINT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
      note_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start ON visits(scheduled_start)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON patient_notes(patient_id)`;

  await sql`
    INSERT INTO staff_users (username, password_hash, full_name, role)
    SELECT 'nurse_sarah', crypt('nurse1234', gen_salt('bf')), 'Nurse Sarah', 'nurse'
    WHERE NOT EXISTS (SELECT 1 FROM staff_users WHERE username = 'nurse_sarah')
  `;

  await sql`
    INSERT INTO staff_users (username, password_hash, full_name, role)
    SELECT 'nurse_mike', crypt('nurse1234', gen_salt('bf')), 'Nurse Mike', 'nurse'
    WHERE NOT EXISTS (SELECT 1 FROM staff_users WHERE username = 'nurse_mike')
  `;

  await sql`
    INSERT INTO family_users (username, password_hash, full_name)
    SELECT 'family_john', crypt('family1234', gen_salt('bf')), 'John Smith Family'
    WHERE NOT EXISTS (SELECT 1 FROM family_users WHERE username = 'family_john')
  `;

  await sql`
    INSERT INTO family_users (username, password_hash, full_name)
    SELECT 'family_mary', crypt('family1234', gen_salt('bf')), 'Mary Johnson Family'
    WHERE NOT EXISTS (SELECT 1 FROM family_users WHERE username = 'family_mary')
  `;

  await sql`
    INSERT INTO patients (medical_record_number, full_name, room_number, status)
    SELECT 'MRN-1001', 'John Smith', 'ICU-101', 'stable'
    WHERE NOT EXISTS (SELECT 1 FROM patients WHERE room_number = 'ICU-101')
  `;

  await sql`
    INSERT INTO patients (medical_record_number, full_name, room_number, status)
    SELECT 'MRN-1002', 'Mary Johnson', 'ICU-102', 'recovering'
    WHERE NOT EXISTS (SELECT 1 FROM patients WHERE room_number = 'ICU-102')
  `;

  await sql`
    INSERT INTO patients (medical_record_number, full_name, room_number, status)
    SELECT 'MRN-1003', 'Robert Davis', 'ICU-103', 'critical'
    WHERE NOT EXISTS (SELECT 1 FROM patients WHERE room_number = 'ICU-103')
  `;

  await sql`
    INSERT INTO family_patient_access (family_user_id, patient_id, can_view_notes, can_schedule_visit)
    SELECT fu.id, p.id, TRUE, TRUE
    FROM family_users fu
    JOIN patients p ON (
      (fu.username = 'family_john' AND p.room_number = 'ICU-101') OR
      (fu.username = 'family_mary' AND p.room_number = 'ICU-102')
    )
    WHERE NOT EXISTS (
      SELECT 1
      FROM family_patient_access fpa
      WHERE fpa.family_user_id = fu.id AND fpa.patient_id = p.id
    )
  `;

  return [
    "staff_users",
    "family_users",
    "patients",
    "family_patient_access",
    "visits",
    "patient_notes",
  ];
}

export async function POST() {
  try {
    const tables = await createSchema();
    return NextResponse.json({
      ok: true,
      message: "Database schema created successfully",
      tables,
    });
  } catch (error) {
    console.error("Database setup failed:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        message: "Database setup failed",
        detail,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}