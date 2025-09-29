export function validateEnv() {
  const demo = process.env.DEMO_MODE === "1";
  const keys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean);
  if (!demo && keys.length === 0) {
    console.warn("[env] DEMO_MODE=0 but no GEMINI_API_KEY_* provided. API calls will fail.");
  }
}

// Call at module import sites (e.g., route.ts) if desired.
