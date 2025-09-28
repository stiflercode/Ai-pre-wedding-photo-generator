import { NextResponse, NextRequest } from "next/server";

// Simple in-memory rate limiter for /api/generate.
// Note: For production, use a durable store (e.g., Upstash Redis) instead.
const windows = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10_000; // 10 seconds
const MAX_REQ = 3; // 3 requests per window per IP

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/api/generate")) {
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const key = `${ip}`;
    const now = Date.now();
    const entry = windows.get(key);
    if (!entry || now > entry.reset) {
      windows.set(key, { count: 1, reset: now + WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > MAX_REQ) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { "content-type": "application/json" } }
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/generate",
};

