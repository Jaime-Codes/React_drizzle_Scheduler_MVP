var express = require("express");
var router = express.Router();
var { db } = require("../drizzle/src");
var {
  appointmentsTable,
  caregiverTable,
  usersTable,
} = require("../drizzle/src/db/schema");
var { eq } = require("drizzle-orm");

router.get("/", async function (req, res) {
  try {
    const appointments = await db
      .select({
        id: appointmentsTable.id,
        startTime: appointmentsTable.startTime,
        endTime: appointmentsTable.endTime,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        caregiverName: usersTable.name,
      })
      .from(appointmentsTable)
      .leftJoin(
        caregiverTable,
        eq(appointmentsTable.caregiverId, caregiverTable.id),
      )
      .leftJoin(usersTable, eq(caregiverTable.userId, usersTable.id));

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to compile system maps" });
  }
});

router.post("/book", async function (req, res) {
  try {
    const { caregiverId, clientId, startTime, endTime, notes } = req.body;

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        caregiverId,
        clientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        status: "pending",
      })
      .returning();

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking execution failed inside engine" });
  }
});

var { eq } = require("drizzle-orm");

router.patch("/:id/review", async function (req, res) {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!action || !["approve", "reject"].includes(action)) {
      res.status(400).json({ error: "Invalid action type parameters." });
      return;
    }

    const targetStatus = action === "approve" ? "scheduled" : "cancelled";

    const [updated] = await db
      .update(appointmentsTable)
      .set({
        status: targetStatus,
        notes: notes ? notes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId))
      .returning();

    res
      .status(200)
      .json({ message: `Appointment successfully ${targetStatus}`, updated });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update review status execution parameters." });
  }
});

module.exports = router;
