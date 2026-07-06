import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-admin-token");
    const expectedPassword = process.env.ADMIN_PASSWORD ?? "viraj@admin";
    if (token !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // validate type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, GIF allowed" }, { status: 400 });
    }

    // unique filename with timestamp
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const timestamp = Date.now();
    const originalName = file.name
      .replace(/\.[^/.]+$/, "")           // remove extension
      .replace(/[^a-z0-9]/gi, "-")        // only alphanumeric + dashes
      .toLowerCase()
      .slice(0, 40);
    const filename = `${originalName}-${timestamp}.${ext}`;

    // save to /public/media/
    const saveDir = path.join(process.cwd(), "public", "media");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    const savePath = path.join(saveDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(savePath, buffer);

    return NextResponse.json({ success: true, path: `/media/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
