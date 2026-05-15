var express = require("express");
var router = express.Router();
var { db } = require("../drizzle/src");
var { caregiverAvailabilityTable } = require("../drizzle/src/db/schema");

router.post("/add", async function (req, res) {
  try {
    const { caregiverId, dayOfWeek, startTime, endTime } = req.body;
    const [record] = await db
      .insert(caregiverAvailabilityTable)
      .values({ caregiverId, dayOfWeek, startTime, endTime })
      .returning();

    res.status(201).json(record);
  } catch (err) {
    console.log("shift error", err);
    res.status(500).json({ error: "Failed to allocate standard shifts" });
  }
});

router.get("/caregiver/:caregiverId", async function (req, res) {
  try {
    const slots = await db
      .select()
      .from(caregiverAvailabilityTable)
      .where(
        eq(
          caregiverAvailabilityTable.caregiverId,
          parseInt(req.params.caregiverId, 10),
        ),
      );

    res.status(200).json(slots);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to extract matching shift parameters" });
  }
});

var { eq } = require("drizzle-orm");

// DELETE an availability slot by its individual table ID
router.delete("/slot/:id", async function (req, res) {
  try {
    const slotId = parseInt(req.params.id, 10);

    await db
      .delete(caregiverAvailabilityTable)
      .where(eq(caregiverAvailabilityTable.id, slotId));

    res.status(200).json({ message: "Availability slot removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove availability slot" });
  }
});

module.exports = router;
