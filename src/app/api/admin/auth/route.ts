import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD ?? "viraj@admin";

    if (password === expectedPassword) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false, error: "Invalid password" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}

// GET: verify existing session token
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "viraj@admin";

  if (token === expectedPassword) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
