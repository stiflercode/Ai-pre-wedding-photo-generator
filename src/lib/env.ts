export function validateEnv() {
  if (!process.env.GEMINI_API_KEY_1) {
    console.warn("[env] GEMINI_API_KEY_1 not provided. API calls will fail.");
  }
}
