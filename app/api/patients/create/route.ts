import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function POST(request: Request) {
  try {
    // Parse request
    const body = await request.json();
    const { fullName, roomNumber, status } = body;

    // Validate
    if (!fullName || !roomNumber || !status) {
      return NextResponse.json(
        { message: "Missing required: fullName, roomNumber, status" },
        { status: 400 }
      );
    }

    const name = String(fullName).trim();
    const room = String(roomNumber).trim();
    const stat = String(status).trim().toLowerCase();

    if (!name || !room) {
      return NextResponse.json(
        { message: "Name and room must not be empty" },
        { status: 400 }
      );
    }

    if (!["stable", "recovering", "critical"].includes(stat)) {
      return NextResponse.json(
        { message: "Status must be: stable, recovering, or critical" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Check room exists
    const existing = (await sql`
      SELECT id FROM patients WHERE room_number = ${room} LIMIT 1
    `) as { id: number }[];

    if (existing.length > 0) {
      return NextResponse.json(
        { message: `Room ${room} already in use` },
        { status: 409 }
      );
    }

    // Generate unique medical record number (MRN)
    // Format: MRN-ROOM-TIMESTAMP (e.g., MRN-ICU-200-1711771234)
    const mrn = `MRN-${room}-${Date.now()}`;

    // Insert patient
    const result = (await sql`
      INSERT INTO patients (medical_record_number, full_name, room_number, status, created_at, updated_at)
      VALUES (${mrn}, ${name}, ${room}, ${stat}, NOW(), NOW())
      RETURNING 
        id::text,
        full_name,
        room_number,
        status,
        created_at::text
    `) as {
      id: string;
      full_name: string;
      room_number: string;
      status: string;
      created_at: string;
    }[];

    if (!result || !result[0]) {
      throw new Error("Insert failed");
    }

    return NextResponse.json(
      {
        message: "Patient added successfully",
        patient: {
          id: result[0].id,
          name: result[0].full_name,
          room_number: result[0].room_number,
          status: result[0].status,
          created_at: result[0].created_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create patient:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to add patient", error: msg },
      { status: 500 }
    );
  }
}
