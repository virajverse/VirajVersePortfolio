import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "viraj@admin";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-token") === ADMIN_PASSWORD;
}

// GET all projects from Supabase
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST create/update project in Supabase
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const payload = {
    id: body.id,
    title: body.title,
    category: body.category,
    description: body.description,
    live: body.live,
    github: body.github || null,
    imageSrc: body.imageSrc || "",
    screenshots: Array.isArray(body.screenshots) ? body.screenshots : [],
    skills: Array.isArray(body.skills) ? body.skills : [],
    highlights: Array.isArray(body.highlights) ? body.highlights : [],
    order: body.order ?? 0,
  };

  const { data, error } = await supabaseAdmin
    .from("projects")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, project: data });
}

// DELETE project from Supabase
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
