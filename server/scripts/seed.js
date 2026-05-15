// scripts/seed.js
const bcrypt = require("bcrypt");
const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
// Change this line if it is inside server/drizzle/src/db/schema
const {
  usersTable,
  caregiverTable,
  clientTable,
} = require("../drizzle/src/db/schema");

require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database with tester profiles...");
  try {
    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Tester Caregiver Core User
    const [cgUser] = await db
      .insert(usersTable)
      .values({
        email: "caregiver@test.com",
        passwordHash: passwordHash,
        name: "Jane Doe, RN",
        age: 34,
        phone: "555-0199",
        role: "caregiver",
      })
      .returning();

    // Spawn Caregiver Profile Extender
    await db.insert(caregiverTable).values({
      userId: cgUser.id,
      licenseNumber: "RN-994821-IL",
      bio: "Compassionate Registered Nurse with over 8 years of specialized home care and geriatric wellness experience.",
      hourlyRate: "45.00",
      timezone: "CST",
    });

    // 2. Create Tester Client Core User
    const [clientUser] = await db
      .insert(usersTable)
      .values({
        email: "client@test.com",
        passwordHash: passwordHash,
        name: "John Smith",
        age: 68,
        phone: "555-0144",
        role: "client",
      })
      .returning();

    // Spawn Client Profile Extender
    await db.insert(clientTable).values({
      userId: clientUser.id,
      address: "2468 Logan Blvd, Chicago, IL 60647",
      emergencyContact: "555-0177 (Daughter - Sarah)",
      notes:
        "Requires assistance with morning mobility exercises. Hard of hearing on left side.",
    });

    console.log("✅ Seeding complete!");
    console.log("➡️ Caregiver Login: caregiver@test.com | password123");
    console.log("➡️ Client Login: client@test.com | password123");
  } catch (err) {
    console.error("❌ Seeding broken:", err);
  } finally {
    await pool.end();
  }
}

seed();
