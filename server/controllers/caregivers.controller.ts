import { Request, Response } from "express";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/src/seed";
import { appointmentsTable } from "../drizzle/src/db/schema";

export async function getCaregiverDashboardData(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const caregiverId = parseInt(req.params.caregiverId as string);

    if (!caregiverId) {
      res.status(400).json({ error: "Caregiver ID is required" });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch Today's Upcoming Appointments
    const todayAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.caregiverId, caregiverId),
          gte(appointmentsTable.startTime, todayStart),
          lte(appointmentsTable.startTime, todayEnd),
          eq(appointmentsTable.status, "scheduled"),
        ),
      );

    // 2. Fetch All Calendar Appointments (e.g., for the current month)
    const allAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.caregiverId, caregiverId));

    // 3. Calculate Total Hours Worked (Aggregation)
    // Subtracts startTime from endTime inside PostgreSQL, converts intervals to hours, and sums them up
    const [hoursResult] = await db
      .select({
        totalHours: sql<string>`COALESCE(SUM(EXTRACT(EPOCH FROM (${appointmentsTable.endTime} - ${appointmentsTable.startTime})) / 3600), 0)`,
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.caregiverId, caregiverId),
          eq(appointmentsTable.status, "completed"),
        ),
      );

    res.status(200).json({
      todayAppointments,
      allAppointments,
      totalHoursWorked: parseFloat(hoursResult.totalHours).toFixed(1),
    });
  } catch (err) {
    console.error("Failed to compile caregiver metrics:", err);
    res
      .status(500)
      .json({ error: "Internal server error gathering dashboard metrics" });
  }
}

// Update an appointment status (Complete, Cancel, No Show)
export async function updateAppointmentStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body; // status: "completed" | "cancelled" | "no_show"

    if (!status) {
      res.status(400).json({ error: "Target status parameter missing" });
      return;
    }

    const [updatedAppointment] = await db
      .update(appointmentsTable)
      .set({
        status,
        notes: notes || undefined,
      })
      .where(eq(appointmentsTable.id, parseInt(appointmentId as string)))
      .returning();

    res.status(200).json({
      message: "Appointment updated",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("Status transition failure:", err);
    res.status(500).json({ error: "Could not modify appointment state" });
  }
}
