import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

interface StatusBody {
  status?: "stable" | "recovering" | "critical" | "recovered" | "discharged";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await context.params;
    const sql = getSql();

    const patient = (await sql`
      SELECT
        p.id::text AS id,
        p.full_name AS name,
        p.status,
        EXISTS (
          SELECT 1
          FROM visits v
          WHERE v.patient_id = p.id
            AND v.status = 'active'
        ) AS call_active,
        (
          SELECT v.scheduled_start::text
          FROM visits v
          WHERE v.patient_id = p.id
            AND v.status IN ('scheduled', 'active')
            AND v.scheduled_start >= NOW() - INTERVAL '2 hours'
          ORDER BY CASE WHEN v.status = 'active' THEN 0 ELSE 1 END, v.scheduled_start ASC
          LIMIT 1
        ) AS scheduled_visit
      FROM patients p
      WHERE p.id = ${patientId}
      LIMIT 1
    `) as {
      id: string;
      name: string;
      status: string;
      call_active: boolean;
      scheduled_visit: string | null;
    }[];

    if (!patient[0]) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient[0]);
  } catch (error) {
    console.error("Failed to fetch status:", error);
    return NextResponse.json({ message: "Failed to fetch status" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const body = (await request.json()) as StatusBody;
    const status = body.status;
    if (!status || !["stable", "recovering", "critical", "recovered", "discharged"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // FIX: In Next.js 15+, params is a Promise and must be awaited
    const { patientId } = await context.params;
    const sql = getSql();

    await sql`
      UPDATE patients
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${patientId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 });
  }
}
