import mysql from "mysql2/promise";


let connection: any = null;

export async function getDB() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,   // set in Docker compose
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  return connection;
}


// Types
export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
  user_id: number;
  due_date: string | null;
  reminder: string | null;
  created_at: Date;
};
