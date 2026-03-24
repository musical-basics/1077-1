"I am building a multi-tenant contractor portal at 1077.io. We need to set up the backend infrastructure, database schema, and authentication flow first. Do not build UI components yet.

Tech Stack:

Framework: Next.js (App Router), deployed on Vercel.

Auth: Clerk.

Database: Neon (Serverless Postgres) using Prisma as the ORM.

Core Objective: Build a relational database and dynamic backend calculation system capable of handling different payment schemes (strict hourly vs. hybrid task-based) for different assistants.

Architectural Requirements:

Auth-to-Database Sync: Use Clerk for user authentication. The Prisma User model must use clerkUserId as its unique identifier. Write the logic for a Clerk Webhook endpoint (/api/webhooks/clerk) that listens for the user.created event and automatically inserts a new row into the Neon database so we can attach a PayProfile to them.

Dynamic Pay Rates: The system must support mixed pay models based on a user's PayProfile. Some users have a hybrid profile (e.g., $25 per Airbnb room, $10 per kitchen, plus a $40 flat weekly stipend for messages). Other users will strictly have an hourly rate (e.g., $25/hr or $27/hr).

Calculation Logic: Create a unified server action that calculates a user's totalPayout for a given week by joining their submitted WorkLog entries against their specific PayProfile.

Role-Based Data: Create a server action to fetch the logged-in user's PayProfile so the frontend will eventually know whether to render a time-clock interface or a task-checkbox interface.

The Exact Prisma Schema:
Please use this exact schema to establish the database relationships:

Code snippet

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") 
}

model User {
  id          String       @id @default(cuid())
  clerkUserId String       @unique
  email       String       @unique
  name        String?
  role        String       @default("assistant")
  payProfile  PayProfile?
  workLogs    WorkLog[]
}

model PayProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  payType        String   // "hourly", "task", "hybrid"
  hourlyRate     Float?   
  airbnbClean    Float?   
  kitchenClean   Float?   
  dogWalk        Float?   
  weeklyStipend  Float?   
}

model WorkLog {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  weekEnding     DateTime
  hoursLogged    Float?
  airbnbCleans   Int?     @default(0)
  kitchenCleans  Int?     @default(0)
  dogWalks       Int?     @default(0)
  expensesTotal  Float?   @default(0)
  receiptUrls    String[] 
  totalPayout    Float
  submittedAt    DateTime @default(now())
}
Next Steps for You:

Initialize the Next.js project structure if necessary.

Implement the Prisma schema provided.

Write the /api/webhooks/clerk route logic.

Write the core calculation server action that generates the totalPayout for a WorkLog submission."