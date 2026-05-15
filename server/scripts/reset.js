// scripts/reset.js
const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const {
  appointmentsTable,
  caregiverAvailabilityTable,
} = require("../drizzle/src/db/schema");
const execSync = require("child_process").execSync;

require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function resetDB() {
  console.log("Flushing appointment and availability data tables...");
  try {
    // 1. Wipe current transaction state layers completely
    await db.delete(appointmentsTable);
    await db.delete(caregiverAvailabilityTable);
    console.log("App tables cleared out.");

    // 2. Re-run your pristine seed file to restore the test profiles smoothly
    console.log("Re-seeding baseline test profiles...");
    execSync("node scripts/seed.js", { stdio: "inherit" });

    console.log("Reset utility loop executed successfully!");
  } catch (err) {
    console.error("Reset script execution crashed:", err);
  } finally {
    await pool.end();
  }
}

resetDB();
