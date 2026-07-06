import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD ?? "viraj@admin";

// GET: fetch all messages (admin only)
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
const ipCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

// POST: submit a contact form message (public)
export async function POST(req: NextRequest) {
  try {
    // Rate limit check to prevent spammers/bots
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    let timestamps = ipCache.get(ip) || [];
    timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
    
    if (timestamps.length >= MAX_REQUESTS) {
      return Response.json(
        { error: "Too many messages sent. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }
    
    timestamps.push(now);
    ipCache.set(ip, timestamps);

    const body = await req.json();
    const { fullName, email, message } = body;

    if (!fullName || !email || !message) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("contact_messages").insert([
      {
        full_name: fullName,
        email,
        message,
      },
    ]);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}

// DELETE: delete a message by id (admin only)
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
