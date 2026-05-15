import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { caregiverAvailabilityTable } from "../drizzle/src/db/schema";
import { db } from "../drizzle/src";

export const setCaregiverAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      caregiverId,
      availabilities,
    }: {
      caregiverId: number;
      availabilities: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }>;
    } = req.body;

    if (!caregiverId || !Array.isArray(availabilities)) {
      res.status(400).json({ error: "Invalid availability payloads" });
      return;
    }

    const insertedSlots = await db.transaction(async (tx) => {
      // Clear out old availability mappings first if rebuilding schedule
      await tx
        .delete(caregiverAvailabilityTable)
        .where(eq(caregiverAvailabilityTable.caregiverId, caregiverId));

      const records = availabilities.map((slot) => ({
        caregiverId,
        dayOfWeek: slot.dayOfWeek, // 0-6 (Sunday-Saturday)
        startTime: slot.startTime, // "09:00"
        endTime: slot.endTime, // "17:00"
      }));

      return await tx
        .insert(caregiverAvailabilityTable)
        .values(records)
        .returning();
    });

    res
      .status(200)
      .json({ message: "Availability updated", schedules: insertedSlots });
  } catch (err) {
    console.error("Error updating scheduling metrics:", err);
    res.status(500).json({ error: "Could not sync profiles" });
  }
};

export async function addAvailabilityBlock(req: Request, res: Response) {
  try {
    const { caregiverId, dayOfWeek, startTime, endTime } = req.body;

    const [slot] = await db
      .insert(caregiverAvailabilityTable)
      .values({
        caregiverId,
        dayOfWeek, // Integer: 0 (Sunday) to 6 (Saturday)
        startTime, // String format matching Mantine: "09:00"
        endTime, // String format matching Mantine: "17:00"
      })
      .returning();

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: "Failed to save availability" });
  }
}
