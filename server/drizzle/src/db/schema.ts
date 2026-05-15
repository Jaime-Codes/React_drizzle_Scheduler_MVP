import {
  integer,
  pgEnum as Enum,
  pgTable,
  timestamp,
  varchar,
  text,
  numeric,
} from "drizzle-orm/pg-core";

export const roleEnum = Enum("role", ["admin", "caregiver", "client"]);

export const appointmentStatusEnum = Enum("appointment_status", [
  "pending",
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  age: integer(),
  phone: varchar({ length: 20 }),
  role: roleEnum().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
//clients
export const clientTable = pgTable("clients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
//caregivers
export const caregiverTable = pgTable("caregivers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  licenseNumber: varchar("license_number", { length: 100 }),
  bio: text(),
  hourlyRate: numeric("hourly_rate"),
  timezone: varchar({ length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const caregiverAvailabilityTable = pgTable("caregiver_availability", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  caregiverId: integer("caregiver_id")
    .notNull()
    .references(() => caregiverTable.id),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: varchar("start_time", {
    length: 10,
  }).notNull(),
  endTime: varchar("end_time", {
    length: 10,
  }).notNull(),
});

//appointments
export const appointmentsTable = pgTable("appointments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  caregiverId: integer("caregiver_id")
    .notNull()
    .references(() => caregiverTable.id),
  clientId: integer("client_id")
    .notNull()
    .references(() => clientTable.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: appointmentStatusEnum().notNull().default("scheduled"),
  notes: text(),
  cancelledBy: roleEnum("cancelled_by"),
  cancellationReason: text("cancellation_reason"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
