import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table")?.trim();

    if (!table) {
      return NextResponse.json({ message: "table query param is required" }, { status: 400 });
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position
    `) as { column_name: string; data_type: string }[];

    return NextResponse.json({ table, columns: rows });
  } catch (error) {
    console.error("Failed to list columns:", error);
    return NextResponse.json({ message: "Failed to list columns" }, { status: 500 });
  }
}
