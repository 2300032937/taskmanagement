import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// -------------------- GET TASKS --------------------
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    // Create DB connection lazily
    const db = await getDB();

    // Base query
    let query = "SELECT * FROM tasks WHERE user_id = ?";
    const values: any[] = [user.id];

    // Add filters dynamically
    if (status) {
      query += " AND status = ?";
      values.push(status);
    }

    if (priority) {
      query += " AND priority = ?";
      values.push(priority);
    }

    if (search) {
      query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)";
      const keyword = `%${search.toLowerCase()}%`;
      values.push(keyword, keyword);
    }

    query += " ORDER BY created_at DESC";

    const [tasks]: any = await db.execute(query, values);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// -------------------- CREATE TASK --------------------
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, priority, status, due_date, reminder } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Insert task
    const [result]: any = await db.execute(
      `INSERT INTO tasks (title, description, priority, status, user_id, due_date, reminder)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        priority || "medium",
        status || "todo",
        user.id,
        due_date || null,
        reminder || null,
      ]
    );

    const taskId = result.insertId;

    // Fetch inserted task
    const [rows]: any = await db.execute(
      "SELECT * FROM tasks WHERE id = ? LIMIT 1",
      [taskId]
    );

    return NextResponse.json(
      { task: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
