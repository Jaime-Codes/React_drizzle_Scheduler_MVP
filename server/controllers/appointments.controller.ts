import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../drizzle/src";
import {
  appointmentsTable,
  usersTable,
  caregiverTable,
  clientTable,
} from "../drizzle/src/db/schema";

export const createAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { caregiverId, clientId, startTime, endTime, notes } = req.body;

    if (!caregiverId || !clientId || !startTime || !endTime) {
      res.status(400).json({ error: "Missing required appointment schedules" });
      return;
    }

    const [newAppointment] = await db
      .insert(appointmentsTable)
      .values({
        caregiverId,
        clientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
      })
      .returning();

    res.status(201).json(newAppointment);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};

export const getAppointmentsWithDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const CaregiverUser = db
      .$with("cg_user")
      .as(
        db
          .select({ id: caregiverTable.id, name: usersTable.name })
          .from(caregiverTable)
          .innerJoin(usersTable, eq(caregiverTable.userId, usersTable.id)),
      );

    const ClientUser = db
      .$with("cl_user")
      .as(
        db
          .select({ id: clientTable.id, name: usersTable.name })
          .from(clientTable)
          .innerJoin(usersTable, eq(clientTable.userId, usersTable.id)),
      );

    const appointments = await db
      .with(CaregiverUser, ClientUser)
      .select({
        id: appointmentsTable.id,
        startTime: appointmentsTable.startTime,
        endTime: appointmentsTable.endTime,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        caregiverName: CaregiverUser.name,
        clientName: ClientUser.name,
      })
      .from(appointmentsTable)
      .innerJoin(
        CaregiverUser,
        eq(appointmentsTable.caregiverId, CaregiverUser.id),
      )
      .innerJoin(ClientUser, eq(appointmentsTable.clientId, ClientUser.id));

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching detailed appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export async function bookAppointment(req: Request, res: Response) {
  try {
    const { caregiverId, clientId, startTime, endTime, notes } = req.body;

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        caregiverId,
        clientId,
        startTime: new Date(startTime), // Ensure conversion to JS Date objects
        endTime: new Date(endTime),
        notes,
        status: "scheduled",
      })
      .returning();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
}
