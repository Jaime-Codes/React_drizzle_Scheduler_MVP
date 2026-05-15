// scripts/reset.js
const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const { db } = require("../drizzle/src/index");
const {
  appointmentsTable,
  caregiverAvailabilityTable,
  usersTable,
} = require("../drizzle/src/db/schema");

require("dotenv").config();

async function resetDB() {
  console.log("Flushing appointment and availability data tables...");
  try {
    // 1. Wipe current transaction state layers completely
    await db.delete(appointmentsTable);
    await db.delete(caregiverAvailabilityTable);
    //delete users
    await db.delete(usersTable);
    console.log("App tables cleared out.");

    console.log("Reset utility loop executed successfully!");
  } catch (err) {
    console.error("Reset script execution crashed:", err);
  }
}

resetDB();
