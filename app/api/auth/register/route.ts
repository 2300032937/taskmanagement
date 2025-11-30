import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";   // ✅ FIXED
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = await getDB(); // 🔥 IMPORTANT

    // ---- CHECK IF USER EXISTS (MYSQL) ----
    const [existingUsers]: any = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // ---- CREATE USER ----
    const [result]: any = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // ---- FETCH NEW USER ----
    const [rows]: any = await db.execute(
      "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const user = rows[0];

    // ---- CREATE JWT + SAVE COOKIE ----
    const token = await createToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json({
      user,
      message: "Registration successful",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
