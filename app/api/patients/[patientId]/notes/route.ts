import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

interface AddNoteBody {
  content?: string;
  authorUsername?: string;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await context.params;
    const sql = getSql();

    const notes = (await sql`
      SELECT
        n.id::text AS id,
        n.note_text AS content,
        n.created_at::text,
        COALESCE(s.full_name, s.username, 'Care Team') AS author
      FROM patient_notes n
      LEFT JOIN staff_users s ON s.id = n.author_staff_id
      WHERE n.patient_id = ${patientId}
      ORDER BY n.created_at DESC
    `) as {
      id: string;
      content: string;
      created_at: string;
      author: string;
    }[];

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ message: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  try {
    const body = (await request.json()) as AddNoteBody;
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ message: "Note content is required" }, { status: 400 });
    }

    // FIX: In Next.js 15+, params is a Promise and must be awaited
    const { patientId } = await context.params;
    const sql = getSql();

    const staffRows = body.authorUsername
      ? ((await sql`
          SELECT id
          FROM staff_users
          WHERE username = ${body.authorUsername}
          LIMIT 1
        `) as { id: string }[])
      : [];

    const fallbackStaff = (await sql`
      SELECT id
      FROM staff_users
      ORDER BY created_at ASC
      LIMIT 1
    `) as { id: string }[];

    const authorStaffId = staffRows[0]?.id ?? fallbackStaff[0]?.id;
    if (!authorStaffId) {
      return NextResponse.json({ message: "No staff user available to author note" }, { status: 400 });
    }

    const rows = (await sql`
      INSERT INTO patient_notes (patient_id, author_staff_id, note_text)
      VALUES (${patientId}, ${authorStaffId}, ${content})
      RETURNING
        id::text AS id,
        note_text AS content,
        created_at::text,
        (SELECT COALESCE(full_name, username, 'Care Team') FROM staff_users WHERE id = ${authorStaffId}) AS author
    `) as {
      id: string;
      content: string;
      created_at: string;
      author: string;
    }[];

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to add note:", error);
    return NextResponse.json({ message: "Failed to add note" }, { status: 500 });
  }
}
