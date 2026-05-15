import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  appointmentsTable,
  caregiverAvailabilityTable,
  caregiverTable,
  clientTable,
  usersTable,
} from "./db/schema";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    usersTable,
    caregiverTable,
    clientTable,
    caregiverAvailabilityTable,
    appointmentsTable,
  },
});

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: "John2",
    age: 30,
    email: "john@example.com",
    passwordHash: "testpw",
    phone: "555-555-5555",
    role: "caregiver",
  };
  const [insertedUser] = await db.insert(usersTable).values(user).returning();

  const careGiver: typeof caregiverTable.$inferInsert = {
    licenseNumber: "2434ew=3",
    userId: insertedUser.id,
    bio: "bio goes here",
    hourlyRate: "55",
    timezone: "CST",
  };

  await db.insert(caregiverTable).values(careGiver);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log("User info updated!");

  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log("User deleted!");
}
