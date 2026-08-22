import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "project-media";

function supabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  );
}

function supabaseSecretKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

export function supabaseAdmin(): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseSecretKey();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Set it to https://YOUR_PROJECT.supabase.co (local .env.local and Vercel env), then restart/redeploy.",
    );
  }
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. In Supabase: Project Settings → API Keys → Secret key (sb_secret_…), not the publishable key.",
    );
  }
  if (key.startsWith("sb_publishable_") || key.includes('"role":"anon"')) {
    throw new Error(
      "That key is the publishable/anon key. Storage uploads need the Secret key (sb_secret_…) or the legacy service_role JWT.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function ensureStorageBucket() {
  const supabase = supabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  if (buckets?.some((bucket) => bucket.name === STORAGE_BUCKET)) return;

  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: "50MB",
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function uploadProjectFile(filename: string, file: File) {
  await ensureStorageBucket();
  const supabase = supabaseAdmin();
  const path = `projects/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
