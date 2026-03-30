import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function POST(
  _request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    // FIX: In Next.js 15+, params is a Promise and must be awaited
    const { patientId } = await context.params;
    const sql = getSql();

    // Generate consistent room name from Patient ID
    // This ensures BOTH nurse and family ALWAYS join the SAME video call room
    // Example: Patient ID "1" → Room: "icu-visit-1"
    // Why this matters: No random room generation, same patient = same meeting
    const roomName = `icu-visit-${patientId.toLowerCase()}`;
    
    // Use Talky.io - completely FREE video conferencing
    // Advantages:
    // ✓ No account needed (anyone can join!)
    // ✓ No moderator required (instant connection)
    // ✓ No login screen (saves time)
    // ✓ Simple & reliable for healthcare use
    // ✓ Perfect for hackathon demo
    const callLink = `https://talky.io/${roomName}`;

    // Try to find an existing scheduled or active visit (exclude completed/ended calls)
    const visits = (await sql`
      SELECT id::text AS id, call_link, status
      FROM visits
      WHERE patient_id = ${patientId}
        AND status IN ('scheduled', 'active')
        AND status != 'completed'
        AND scheduled_start >= NOW() - INTERVAL '2 hours'
      ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, scheduled_start ASC
      LIMIT 1
    `) as {
      id: string;
      call_link: string | null;
      status: string;
    }[];

    let visitId: string;
    
    if (visits[0]) {
      // FIX: Use existing scheduled visit
      visitId = visits[0].id;
      await sql`
        UPDATE visits
        SET
          status = 'active',
          call_link = ${callLink},
          updated_at = NOW()
        WHERE id = ${visitId}
      `;
    } else {
      // FIX: Auto-create a visit if none exists (allows ad-hoc calls)
      // This is useful for emergency situations where immediate video calls are needed
      // without prior scheduling. The visit is created with current time and 1 hour duration.
      const result = (await sql`
        INSERT INTO visits (patient_id, scheduled_start, scheduled_end, status, call_link, created_at, updated_at)
        VALUES (
          ${patientId},
          NOW(),
          NOW() + INTERVAL '1 hour',
          'active',
          ${callLink},
          NOW(),
          NOW()
        )
        RETURNING id::text AS id
      `) as { id: string }[];
      
      visitId = result[0].id;
    }

    return NextResponse.json({
      call_link: callLink,
      room_name: roomName,
      visit_id: visitId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to start/join call:", error);
    return NextResponse.json(
      { 
        message: "Failed to start call",
        error: errorMessage,
        details: "Please check if the patient exists and the database is connected"
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await context.params;
    const sql = getSql();

    // Mark the active visit as completed to prevent rejoining ended calls
    await sql`
      UPDATE visits
      SET
        status = 'completed',
        updated_at = NOW()
      WHERE patient_id = ${patientId}
        AND status = 'active'
    `;

    return NextResponse.json({ success: true, message: "Call ended successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to end call:", error);
    return NextResponse.json(
      { 
        message: "Failed to end call",
        error: errorMessage,
      }, 
      { status: 500 }
    );
  }
}
