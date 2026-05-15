import { Request, Response } from "express";
import { db } from "../drizzle/src";
import {
  usersTable,
  caregiverTable,
  clientTable,
} from "../drizzle/src/db/schema";

module.exports = {
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    const users = await db.select().from(usersTable);
    res.json(users);
  },

  createUserProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, passwordHash, age, phone, role, profileData } =
        req.body;

      if (!email || !passwordHash || !role || !name) {
        res.status(400).json({ error: "Missing required core fields" });
        return;
      }

      const result = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(usersTable)
          .values({ name, email, passwordHash, age, phone, role })
          .returning();

        if (role === "caregiver") {
          await tx.insert(caregiverTable).values({
            userId: newUser.id,
            licenseNumber: profileData?.licenseNumber,
            bio: profileData?.bio,
            hourlyRate: profileData?.hourlyRate,
            timezone: profileData?.timezone,
          });
        } else if (role === "client") {
          await tx.insert(clientTable).values({
            userId: newUser.id,
            address: profileData?.address,
            emergencyContact: profileData?.emergencyContact,
            notes: profileData?.notes,
          });
        }

        return newUser;
      });

      res
        .status(201)
        .json({ message: "User profile created successfully", user: result });
    } catch (err: any) {
      console.error("Error creating user profile:", err);
      if (err.code === "23505") {
        // PostgreSQL unique violation code
        res.status(400).json({ error: "Email already exists" });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
