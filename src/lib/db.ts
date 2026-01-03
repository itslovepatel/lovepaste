// In-memory store for development (replace with Supabase in production)
// To use Supabase, set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

interface Paste {
  id: string;
  content: string;
  language: string;
  expires_at: string | null;
  created_at: string;
}

// Security: Maximum number of pastes to store (prevents memory exhaustion)
const MAX_PASTES = 10000;

// Global in-memory store that persists across API calls
const globalForPastes = globalThis as unknown as { 
  pastes: Map<string, Paste>;
  cleanupInterval?: NodeJS.Timeout;
};
const memoryStore = globalForPastes.pastes || new Map<string, Paste>();
globalForPastes.pastes = memoryStore;

// Periodic cleanup of expired pastes (runs every 5 minutes)
if (!globalForPastes.cleanupInterval) {
  globalForPastes.cleanupInterval = setInterval(() => {
    cleanupExpiredPastes();
  }, 5 * 60 * 1000);
}

function cleanupExpiredPastes(): void {
  const now = new Date();
  for (const [id, paste] of memoryStore.entries()) {
    if (paste.expires_at && new Date(paste.expires_at) < now) {
      memoryStore.delete(id);
    }
  }
}

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

    // Security: Check if we've hit the maximum number of pastes
    if (memoryStore.size >= MAX_PASTES) {
      // Clean up expired pastes first
      cleanupExpiredPastes();
      
      // If still at capacity, reject new pastes
      if (memoryStore.size >= MAX_PASTES) {
        return { success: false, error: "Storage limit reached. Please try again later." };
      }
    }

    // Security: Check for ID collision
    if (memoryStore.has(data.id)) {
      return { success: false, error: "Paste ID already exists" };
    }

    const paste: Paste = {
      id: data.id,
      content: data.content,
      language: data.language,
      expires_at: data.expires_at ?? null,
      created_at: new Date().toISOString(),
    };

    memoryStore.set(data.id, paste);

    return { success: true };
  } catch {
    return { success: false, error: "Failed to create paste" };
  }
}

export async function getPaste(id: string): Promise<Paste | null> {
  try {
    // Security: Validate ID format before lookup
    if (!isValidId(id)) {
      return null;
    }

    const paste = memoryStore.get(id);

    if (!paste) return null;

    // Check expiration
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      memoryStore.delete(id);
      return null;
    }

    return paste;
  } catch {
    return null;
  }
}

export async function getAllPastes(): Promise<Paste[]> {
  const pastes = Array.from(memoryStore.values());
  const now = new Date();

  // Filter out expired pastes
  return pastes.filter((paste) => {
    if (paste.expires_at && new Date(paste.expires_at) < now) {
      memoryStore.delete(paste.id);
      return false;
    }
    return true;
  });
}
