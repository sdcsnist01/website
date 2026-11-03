import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Message should be at least 10 characters." }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name,
      email,
      message,
    });

    if (error) {
      console.error("contact_messages insert failed:", error);
      return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
