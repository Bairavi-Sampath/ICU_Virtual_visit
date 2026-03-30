import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

type PatientRow = {
  id: string;
  name: string;
  room_number: string;
  status: "stable" | "recovering" | "critical";
  scheduled_visit: string | null;
  call_active: boolean;
};

type NoteRow = {
  id: string;
  content: string;
  created_at: string;
  author: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    // FIX: In Next.js 15+, params is a Promise and must be awaited
    const { patientId } = await context.params;
    const sql = getSql();

    // FIX: Auto-complete calls that have passed their scheduled end time
    // or calls that have been running for 4+ hours
    await sql`
      UPDATE visits
      SET status = 'completed', updated_at = NOW()
      WHERE patient_id = ${patientId}
        AND status = 'active'
        AND (
          (scheduled_end IS NOT NULL AND scheduled_end < NOW())
          OR (updated_at < NOW() - INTERVAL '4 hours')
        )
    `;

    const rows = (await sql`
      SELECT
        p.id::text AS id,
        p.full_name AS name,
        p.room_number,
        p.status,
        (
          SELECT v.scheduled_start::text
          FROM visits v
          WHERE v.patient_id = p.id
            AND v.status IN ('scheduled', 'active')
            AND v.scheduled_start >= NOW() - INTERVAL '2 hours'
          ORDER BY CASE WHEN v.status = 'active' THEN 0 ELSE 1 END, v.scheduled_start ASC
          LIMIT 1
        ) AS scheduled_visit,
        EXISTS (
          SELECT 1
          FROM visits v
          WHERE v.patient_id = p.id
            AND v.status = 'active'
        ) AS call_active
      FROM patients p
      WHERE p.id = ${patientId}
      LIMIT 1
    `) as PatientRow[];

    const patient = rows[0];
    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const notes = (await sql`
      SELECT
        n.id::text AS id,
        n.note_text AS content,
        n.created_at::text,
        COALESCE(s.full_name, s.username, 'Care Team') AS author
      FROM patient_notes n
      LEFT JOIN staff_users s ON s.id = n.author_staff_id
      WHERE n.patient_id = ${patientId}
      ORDER BY n.created_at DESC
    `) as NoteRow[];

    return NextResponse.json({ ...patient, notes });
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return NextResponse.json({ message: "Failed to fetch patient" }, { status: 500 });
  }
}
