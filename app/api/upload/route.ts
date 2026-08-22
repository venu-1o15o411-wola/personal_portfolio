import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadProjectFile } from "@/lib/supabase";

export const runtime = "nodejs";

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const filename = `${nanoid(10)}-${safeFilename(file.name || "image.jpg")}`;

  try {
    const url = await uploadProjectFile(filename, file);
    return NextResponse.json({ url });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      {
        error: detail,
        detail,
      },
      { status: 500 },
    );
  }
}
