import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { createPaste, getPaste } from "@/lib/db";

// Use only lowercase letters and numbers, avoiding confusing characters (0, o, l, 1)
const generateId = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 5);

// Security constants
const MAX_CONTENT_SIZE = 500000; // 500KB max paste size
const MAX_REQUESTS_PER_MINUTE = 10;
const ALLOWED_LANGUAGES = [
  "plaintext", "javascript", "typescript", "python", "java", "csharp", "cpp",
  "go", "rust", "ruby", "php", "swift", "kotlin", "sql", "html", "css",
  "json", "yaml", "markdown", "bash"
];
const ALLOWED_EXPIRATIONS = ["1h", "1d", "7d", "30d", "never"];

// Simple in-memory rate limiter (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: Request): string {
  // Get IP from various headers (works with proxies/load balancers)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - record.count };
}

// Sanitize content - remove null bytes and other dangerous characters
function sanitizeContent(content: string): string {
  return content
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ""); // Remove control characters except \t, \n, \r
}

// Validate and sanitize language
function sanitizeLanguage(language: unknown): string {
  if (typeof language !== "string") return "plaintext";
  const lower = language.toLowerCase().trim();
  return ALLOWED_LANGUAGES.includes(lower) ? lower : "plaintext";
}

// Validate expiration
function validateExpiration(expiration: unknown): string {
  if (typeof expiration !== "string") return "1d";
  return ALLOWED_EXPIRATIONS.includes(expiration) ? expiration : "1d";
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS_PER_MINUTE.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    // Check content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    // Parse body with size limit check
    let body;
    try {
      const text = await req.text();
      if (text.length > MAX_CONTENT_SIZE + 1000) { // Extra buffer for JSON overhead
        return NextResponse.json(
          { error: `Content too large. Maximum size is ${MAX_CONTENT_SIZE / 1000}KB` },
          { status: 413 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { content, language, expiration } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > MAX_CONTENT_SIZE) {
      return NextResponse.json(
        { error: `Content too large. Maximum size is ${MAX_CONTENT_SIZE / 1000}KB` },
        { status: 413 }
      );
    }

    // Sanitize inputs
    const sanitizedContent = sanitizeContent(trimmedContent);
    const sanitizedLanguage = sanitizeLanguage(language);
    const validatedExpiration = validateExpiration(expiration);

    // Generate unique ID with collision check
    let shortId: string;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      shortId = generateId();
      const existing = await getPaste(shortId);
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique ID. Please try again." },
        { status: 500 }
      );
    }

    // Calculate expiration time
    let expiresAt: string | null = null;
    if (validatedExpiration !== "never") {
      const now = new Date();
      switch (validatedExpiration) {
        case "1h":
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          break;
        case "1d":
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case "7d":
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "30d":
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }

    const result = await createPaste({
      id: shortId,
      content: sanitizedContent,
      language: sanitizedLanguage,
      expires_at: expiresAt,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create paste" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ id: shortId });
    response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_MINUTE.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    
    return response;
  } catch (error) {
    // Don't expose internal error details
    console.error("Error creating paste:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
