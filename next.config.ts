import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        // Allow data: images (for DEMO_MODE) and self scripts/styles. Looser in dev to avoid DX issues.
        { key: "Content-Security-Policy", value: isProd
          ? "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:;"
          : "default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' ws:; font-src 'self' data:;" },
      ],
    },
  ],
};

export default nextConfig;
