import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET() {
  try {
    const sql = getSql();

    const stats = (await sql`
      SELECT
        (SELECT COUNT(*)::int FROM staff_users) AS staff_users,
        (SELECT COUNT(*)::int FROM family_users) AS family_users,
        (SELECT COUNT(*)::int FROM patients) AS patients,
        (SELECT COUNT(*)::int FROM family_patient_access) AS family_patient_access,
        (SELECT COUNT(*)::int FROM visits) AS visits,
        (SELECT COUNT(*)::int FROM patient_notes) AS patient_notes
    `) as Array<Record<string, number>>;

    return NextResponse.json({ ok: true, counts: stats[0] ?? {} });
  } catch (error) {
    console.error("Failed to fetch DB stats:", error);
    return NextResponse.json({ ok: false, message: "Failed to fetch DB stats" }, { status: 500 });
  }
}
