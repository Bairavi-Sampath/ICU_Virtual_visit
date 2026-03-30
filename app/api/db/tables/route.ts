import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET() {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `) as { table_name: string }[];

    return NextResponse.json({
      ok: true,
      tables: rows.map((row) => row.table_name),
    });
  } catch (error) {
    console.error("Failed to list tables:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to list tables",
      },
      { status: 500 },
    );
  }
}