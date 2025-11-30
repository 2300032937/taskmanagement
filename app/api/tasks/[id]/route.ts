import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// -------------------- UPDATE TASK --------------------
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = await params;

    const { title, description, priority, status, due_date, reminder } =
      await request.json();

    const db = await getDB();

    // Ensure task belongs to this user
    const [existing]: any = await db.execute(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ? LIMIT 1",
      [taskId, user.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Prepare dynamic update fields
    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (priority !== undefined) { fields.push("priority = ?"); values.push(priority); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }
    if (due_date !== undefined) { fields.push("due_date = ?"); values.push(due_date); }
    if (reminder !== undefined) { fields.push("reminder = ?"); values.push(reminder); }

    if (fields.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // Add WHERE part parameters
    values.push(taskId, user.id);

    await db.execute(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );

    // Fetch updated task
    const [updated]: any = await db.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1",
      [taskId, user.id]
    );

    return NextResponse.json({ task: updated[0] });

  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// -------------------- DELETE TASK --------------------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: taskId } = await params;

    const db = await getDB();

    const [result]: any = await db.execute(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
