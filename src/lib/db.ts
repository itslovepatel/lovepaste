// Database layer using Supabase PostgreSQL
import { createClient } from "@supabase/supabase-js";

interface Paste {
  id: string;
  content: string;
  language: string;
  expires_at: string | null;
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Validate paste ID format (only allowed characters)
function isValidId(id: string): boolean {
  return /^[a-z2-9]{5}$/.test(id);
}

export async function createPaste(data: {
  id: string;
  content: string;
  language: string;
  expires_at?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Security: Validate ID format
    if (!isValidId(data.id)) {
      return { success: false, error: "Invalid paste ID format" };
    }

    const { error } = await supabase.from("pastes").insert({
      id: data.id,
      content: data.content,
      language: data.language,
      expires_at: data.expires_at ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Unique constraint violation = ID already exists
      if (error.code === "23505") {
        return { success: false, error: "Paste ID already exists" };
      }
      console.error("Supabase insert error:", error);
      return { success: false, error: "Failed to create paste" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to create paste:", error);
    return { success: false, error: "Failed to create paste" };
  }
}

export async function getPaste(id: string): Promise<Paste | null> {
  try {
    // Security: Validate ID format before lookup
    if (!isValidId(id)) {
      return null;
    }

    const { data, error } = await supabase
      .from("pastes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Delete expired paste
      await supabase.from("pastes").delete().eq("id", id);
      return null;
    }

    return data as Paste;
  } catch (error) {
    console.error("Failed to get paste:", error);
    return null;
  }
}

export async function deletePaste(id: string): Promise<boolean> {
  try {
    if (!isValidId(id)) return false;

    const { error } = await supabase.from("pastes").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
