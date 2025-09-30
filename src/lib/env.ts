export function validateEnv() {
  const keys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean);
  if (keys.length === 0) {
    console.warn("[env] No GEMINI_API_KEY_* provided. API calls will fail.");
  }
}
