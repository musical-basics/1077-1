import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET env var");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // ── Verify Svix signature ──────────────────────────────
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── Handle user.created ────────────────────────────────
  if (event.type === "user.created") {
    const { id: clerkUserId, email_addresses, first_name, last_name } =
      event.data;

    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      console.error("user.created event missing email");
      return NextResponse.json(
        { error: "No email in payload" },
        { status: 400 }
      );
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        role: "assistant",
      },
    });

    console.log(`✅ Created DB user for Clerk user ${clerkUserId}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
