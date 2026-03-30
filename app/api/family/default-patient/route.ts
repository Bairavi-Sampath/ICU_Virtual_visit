import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();
    const sql = getSql();

    if (username) {
      const mappedRows = (await sql`
        SELECT fpa.patient_id
        FROM family_users fu
        JOIN family_patient_access fpa ON fpa.family_user_id = fu.id
        WHERE fu.username = ${username}
        ORDER BY fpa.created_at ASC
        LIMIT 1
      `) as { patient_id: string }[];

      if (mappedRows[0]?.patient_id) {
        return NextResponse.json({ patientId: mappedRows[0].patient_id });
      }
    }

    const fallbackRows = (await sql`
      SELECT id
      FROM patients
      ORDER BY room_number ASC
      LIMIT 1
    `) as { id: string }[];

    return NextResponse.json({ patientId: fallbackRows[0]?.id ?? null });
  } catch (error) {
    console.error("Failed to resolve family patient:", error);
    return NextResponse.json({ message: "Failed to resolve family patient" }, { status: 500 });
  }
}
