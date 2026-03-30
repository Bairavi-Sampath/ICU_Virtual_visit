import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET() {
  try {
    const sql = getSql();
    const result = (await sql`SELECT NOW()::text AS now`) as { now: string }[];

    return NextResponse.json({
      ok: true,
      now: result[0]?.now ?? null,
      message: "Neon connection successful",
    });
  } catch (error) {
    console.error("Neon connection failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Neon connection failed",
      },
      { status: 500 },
    );
  }
}
