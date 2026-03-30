import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { getSql } from "@/lib/neon";

interface SignInBody {
  username?: string;
  password?: string;
  role?: "nurse" | "family";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInBody;
    const { username, password, role } = body;

    // Validation
    if (!username || !password || !role) {
      return NextResponse.json(
        { message: "Username, password, and role are required" },
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

    let user: { id: string; password_hash: string; full_name: string; username: string } | null = null;

    if (role === "nurse") {
      const result = (await sql`
        SELECT id, password_hash, full_name, username
        FROM staff_users
        WHERE username = ${username}
        LIMIT 1
      `) as { id: string; password_hash: string; full_name: string; username: string }[];
      user = result[0] || null;
    } else {
      const result = (await sql`
        SELECT id, password_hash, full_name, username
        FROM family_users
        WHERE username = ${username}
        LIMIT 1
      `) as { id: string; password_hash: string; full_name: string; username: string }[];
      user = result[0] || null;
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          id: user.id,
          username: user.username,
          name: user.full_name,
          role
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to sign in:", error);
    return NextResponse.json(
      { message: "Failed to sign in" },
      { status: 500 }
    );
  }
}
