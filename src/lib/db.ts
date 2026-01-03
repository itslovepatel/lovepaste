// Database layer that supports both Vercel KV (production) and in-memory (development)
import { kv } from "@vercel/kv";

interface Paste {
  id: string;
  content: string;
  language: string;
  expires_at: string | null;
  created_at: string;
}

// Check if we're using Vercel KV (production) or in-memory (development)
const useVercelKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback for local development
const globalForPastes = globalThis as unknown as { 
  pastes: Map<string, Paste>;
};
const memoryStore = globalForPastes.pastes || new Map<string, Paste>();
globalForPastes.pastes = memoryStore;

// Validate paste ID format (only allowed characters)
function isValidId(id: string): boolean {
  return /^[a-z2-9]{5}$/.test(id);
}

// Calculate TTL in seconds from expires_at date
function getTTL(expires_at: string | null): number | undefined {
  if (!expires_at) return undefined; // No expiration
  const expiresDate = new Date(expires_at);
  const now = new Date();
  const ttlSeconds = Math.floor((expiresDate.getTime() - now.getTime()) / 1000);
  return ttlSeconds > 0 ? ttlSeconds : 1; // Minimum 1 second
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

    const paste: Paste = {
      id: data.id,
      content: data.content,
      language: data.language,
      expires_at: data.expires_at ?? null,
      created_at: new Date().toISOString(),
    };

    if (useVercelKV) {
      // Use Vercel KV in production
      const key = `paste:${data.id}`;
      const existing = await kv.get(key);
      
      if (existing) {
        return { success: false, error: "Paste ID already exists" };
      }

      const ttl = getTTL(data.expires_at ?? null);
      if (ttl) {
        await kv.set(key, paste, { ex: ttl });
      } else {
        // No expiration - set for 30 days max to prevent indefinite storage
        await kv.set(key, paste, { ex: 30 * 24 * 60 * 60 });
      }
    } else {
      // Use in-memory store for development
      if (memoryStore.has(data.id)) {
        return { success: false, error: "Paste ID already exists" };
      }
      memoryStore.set(data.id, paste);
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

    if (useVercelKV) {
      // Use Vercel KV in production
      const paste = await kv.get<Paste>(`paste:${id}`);
      
      if (!paste) return null;

      // Check expiration (KV should auto-expire, but double-check)
      if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
        await kv.del(`paste:${id}`);
        return null;
      }

      return paste;
    } else {
      // Use in-memory store for development
      const paste = memoryStore.get(id);

      if (!paste) return null;

      // Check expiration
      if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
        memoryStore.delete(id);
        return null;
      }

      return paste;
    }
  } catch (error) {
    console.error("Failed to get paste:", error);
    return null;
  }
}

export async function deletePaste(id: string): Promise<boolean> {
  try {
    if (!isValidId(id)) return false;

    if (useVercelKV) {
      await kv.del(`paste:${id}`);
    } else {
      memoryStore.delete(id);
    }
    return true;
  } catch {
    return false;
  }
}
