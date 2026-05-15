var express = require("express");
var router = express.Router();
var { db } = require("../drizzle/src");
var { caregiverTable, usersTable } = require("../drizzle/src/db/schema");
var { eq } = require("drizzle-orm");

router.get("/caregivers-list", async function (req, res) {
  try {
    const list = await db
      .select({
        value: caregiverTable.id,
        label: usersTable.name,
      })
      .from(caregiverTable)
      .innerJoin(usersTable, eq(caregiverTable.userId, usersTable.id));

    res.status(200).json(list);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to construct caregiver lookup matrix" });
  }
});

module.exports = router;
