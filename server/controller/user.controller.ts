import { type Request, type Response } from "express"; // Ensure Express types are imported
import { db } from "../drizzle/src";
import { usersTable } from "../drizzle/src/db/schema";

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await db.select().from(usersTable);
    console.log("these are the users", users);
    res.json(users);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
}
