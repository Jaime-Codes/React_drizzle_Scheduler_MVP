import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../drizzle/src";
import { clientTable, usersTable } from "../drizzle/src/db/schema";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "fallback_access_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key";

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, username.toLowerCase().trim()));

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const access = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refresh = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      access,
      refresh,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // "caregiver" | "client" | "admin"
      },
    });
  } catch (err) {
    console.error("Authentication engine breakdown:", err);
    res.status(500).json({ error: "Internal server processing failure" });
  }
};

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const emailClean = username.toLowerCase().trim();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: emailClean,
        passwordHash: hashedPassword,
        name: emailClean.split("@")[0],
        role: role || "client",
      })
      .returning();

    await db.insert(clientTable).values({
      userId: newUser.id,
    });

    res.status(201).json({
      message: "Registration successful",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (err: any) {
    console.error("Registration structural failure:", err);

    //TODO verify if needed: PostgreSQL error code 23505 is Unique Violation (email already registered)
    if (err.code === "23505") {
      res
        .status(400)
        .json({ error: "An account with this email already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to compile user registry" });
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refresh } = req.body;

    if (!refresh) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    jwt.verify(refresh, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ error: "Invalid or expired refresh token" });
        return;
      }

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        JWT_ACCESS_SECRET,
        { expiresIn: "15m" },
      );
      res.status(200).json({
        access: newAccessToken,
      });
    });
  } catch (err) {
    console.error("Token verification pipeline crash:", err);
    res.status(500).json({ error: "Internal token refresh failure" });
  }
};
