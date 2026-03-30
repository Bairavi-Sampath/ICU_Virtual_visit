import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      console.log("❌ [DELETE PATIENT] Missing patient ID");
      return NextResponse.json(
        { message: "Patient ID is required" },
        { status: 400 }
      );
    }

    console.log(`🗑️ [DELETE PATIENT] Attempting to delete patient ID: ${id}`);
    const sql = getSql();

    // Verify patient exists
    console.log(`🔍 [DELETE PATIENT] Checking if patient exists...`);
    const existing = (await sql`
      SELECT id, full_name, status FROM patients WHERE id = ${id}
    `) as { id: number; full_name: string; status: string }[];

    if (existing.length === 0) {
      console.log(`❌ [DELETE PATIENT] Patient not found: ${id}`);
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    const patient = existing[0];
    console.log(`✅ [DELETE PATIENT] Patient found: ${patient.full_name} (Status: ${patient.status})`);

    // Delete patient and all associated records (CASCADE)
    console.log(`🗑️ [DELETE PATIENT] Deleting patient and related records...`);
    
    await sql`
      DELETE FROM patients WHERE id = ${id}
    `;

    console.log(`✅ [DELETE PATIENT] Patient deleted successfully: ${patient.full_name}`);

    return NextResponse.json(
      {
        message: `Patient "${patient.full_name}" deleted successfully`,
        deletedPatient: {
          id: String(patient.id),
          name: patient.full_name,
          status: patient.status
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [DELETE PATIENT] ERROR:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }

    const msg = error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { 
        message: "Failed to delete patient",
        error: msg
      },
      { status: 500 }
    );
  }
}
