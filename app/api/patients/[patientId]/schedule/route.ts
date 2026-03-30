import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

interface ScheduleVisitBody {
  date?: string;
  time?: string;
  duration?: number;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const body = (await request.json()) as ScheduleVisitBody;
    // FIX: In Next.js 15+, params is a Promise and must be awaited
    const { patientId } = await context.params;

    if (!body.date || !body.time) {
      return NextResponse.json({ message: "date and time are required" }, { status: 400 });
    }

    const scheduledAt = new Date(`${body.date}T${body.time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ message: "Invalid date/time" }, { status: 400 });
    }

    const durationMinutes = Math.max(5, Number(body.duration ?? 30));
    const sql = getSql();

    const familyRows = (await sql`
      SELECT family_user_id
      FROM family_patient_access
      WHERE patient_id = ${patientId}
        AND can_schedule_visit = TRUE
      ORDER BY created_at ASC
      LIMIT 1
    `) as { family_user_id: string }[];

    const familyUserId = familyRows[0]?.family_user_id;
    if (!familyUserId) {
      return NextResponse.json(
        { message: "No family member is linked to this patient yet" },
        { status: 400 },
      );
    }

    const staffRows = (await sql`
      SELECT id
      FROM staff_users
      ORDER BY created_at ASC
      LIMIT 1
    `) as { id: string }[];

    const staffUserId = staffRows[0]?.id ?? null;

    await sql`
      INSERT INTO visits (
        patient_id,
        family_user_id,
        created_by_staff_id,
        scheduled_start,
        scheduled_end,
        status
      )
      VALUES (
        ${patientId},
        ${familyUserId},
        ${staffUserId},
        ${scheduledAt.toISOString()},
        ${(new Date(scheduledAt.getTime() + durationMinutes * 60000)).toISOString()},
        'scheduled'
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to schedule visit:", error);
    return NextResponse.json({ message: "Failed to schedule visit" }, { status: 500 });
  }
}
