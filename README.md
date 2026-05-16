# Caregiver and Client Scheduling Hub (MVP Prototype)

functional Minimum Viable Product (MVP) built over a tight timeline. It serves as a proof-of-concept for home care scheduling automation. Caregivers declare recurring weekly shift parameters, and clients select validated 1-hour service windows matching those active parameters.

## Core Application Features

1. **Role-Specific Onboarding:** Registration forms gather distinct datasets conditionally based on selection (License Number and Hourly Rate for Caregivers; Home Address and Emergency Contacts for Clients).
2. **Shift Allocation Matrix:** Caregivers set baseline recurring working hour rules using a sliding drawer panel interface.
3. **Validated Booking Interfaces:** Clients select a specific caregiver, view an illuminated calendar showing only that caregiver's active workdays, and click 1-hour increment chips to build precise appointment ranges.
4. **Verification Gateways:** All user booking requests default to a Pending state. Caregivers review notes from their dashboard and explicitly Approve or Reject incoming shifts.

## Tech Stack

- Frontend: React (Vite), TypeScript, Mantine UI Components
- Backend: Node.js, Express API Gateway (CommonJS modules), JWT, Bcrypt
- Database and ORM: PostgreSQL database engine, Drizzle ORM
- Containerization: Multi-container deployment via Docker Compose

## Environment Initialisation

### 1. Configuration Setup

Create a file named `.env` in your root backend folder directory containing the local network configuration variables:

```text
DATABASE_URL=postgres://dev_user:dev_password@db:5432/schedule_db
PORT=3000
JWT_ACCESS_SECRET=your_hex_access_string_here
JWT_REFRESH_SECRET=your_hex_refresh_string_here
```

### 2. Execution Command

From the root repository folder containing your docker-compose.yml file, run the initialization command:

```bash
docker compose up --build
```

- Frontend client maps to: http://localhost:5173
- API gateway server maps to: http://localhost:3000
- Database management utility maps to: http://localhost:8080 (User: admin@example.com | Pass: admin)

### 3. Synchronize Database Tables

Once console outputs verify the database container has finished booting, open a separate terminal window and execute the schema migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Inject Mock Testing Profiles (Seeding)

To bypass the manual registration flows and test the cross-role features immediately, seed the database tables using the test utility script:

```bash
docker compose exec backend npm run seed
```

This registers two accounts inside the system instantly:

- Caregiver Profile: caregiver@test.com | Password: password123
- Client Profile: client@test.com | Password: password123

## Automated Reset Hook

To flush active user testing states out of the schedules and revert the platform cleanly back to its baseline default configuration, run the reset utility:

```bash
docker compose exec backend node scripts/reset.js
```

## Post-MVP Production Backlog

1. **Automated Testing Suites:**
   - Unit and Integration Tests: Deploy Jest and Supertest wrappers across the Express API endpoints to automate deployment regressions.
   - End-to-End Tests: Implement Playwright or Cypress workflows to simulate complete registration, shift setting, booking, and approval cycles.

2. **Centralized Administrator Dashboard:**
   - Transition account control privileges to a dedicated administrative user tier (role: "admin").
   - Enable remote cancellation reversals to re-activate accidentally rejected client bookings.
   - Authorize administrative staff to forcefully patch or clear employee availability tables on behalf of field staff during unmapped personal leaves.

3. **Algorithmic Race Condition Prevention:**
   - Implement real-time overlap checks. When a client books an hourly chip, that time slot will immediately hide from all other users searching that caregiver's availability matrix simultaneously.
