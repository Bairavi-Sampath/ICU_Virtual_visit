import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { getSql } from "@/lib/neon";

interface SignUpBody {
  username?: string;
  password?: string;
  fullName?: string;
  role?: "nurse" | "family";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpBody;
    const { username, password, fullName, role } = body;

    // Validation
    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!["nurse", "family"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Check if user already exists
    const existingUser = role === "nurse"
      ? (await sql`
          SELECT id FROM staff_users WHERE username = ${username}
          LIMIT 1
        `) as { id: string }[]
      : (await sql`
          SELECT id FROM family_users WHERE username = ${username}
          LIMIT 1
        `) as { id: string }[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    if (role === "nurse") {
      // Create staff user
      await sql`
        INSERT INTO staff_users (username, password_hash, full_name, created_at, updated_at)
        VALUES (${username}, ${hashedPassword}, ${fullName}, NOW(), NOW())
      `;
    } else {
      // Create family user
      await sql`
        INSERT INTO family_users (username, password_hash, full_name, created_at, updated_at)
        VALUES (${username}, ${hashedPassword}, ${fullName}, NOW(), NOW())
      `;
    }

    return NextResponse.json(
      { 
        message: "Account created successfully",
        role,
        username
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to sign up:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    );
  }
}
