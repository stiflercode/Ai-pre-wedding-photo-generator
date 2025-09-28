import { NextRequest } from "next/server";
import { GoogleGenerativeAI, type GenerateContentRequest, type Part } from "@google/generative-ai";
import { STYLE_MAP } from "@/lib/styles";
import { validateEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MODEL_NAMES = ["gemini-2.5-flash-image-preview", "gemini-1.5-flash"];
const DEMO_MODE = process.env.DEMO_MODE === "1";

async function fileToInlineData(file: File) {
  const ab = await file.arrayBuffer();
  const b64 = Buffer.from(ab).toString("base64");
  return { inlineData: { data: b64, mimeType: file.type } } as const;
}

function getKeys() {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];
  if (keys.length === 0) throw new Error("Missing GEMINI_API_KEY envs");
  return keys;
}

async function generateOne(
  basePrompt: string,
  img1: File,
  img2: File,
  attemptSeed: number,
  key: string,
  modelName: string
) {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelName });
  const imagePart1 = await fileToInlineData(img1);
  const imagePart2 = await fileToInlineData(img2);
  const prompt = `${basePrompt}\nMake a single high-quality realistic image of the couple using the provided reference faces and outfits. Ensure romantic composition and photography aesthetics. Variation seed: ${attemptSeed}.`;

  const req: GenerateContentRequest = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          imagePart1 as unknown as Part,
          imagePart2 as unknown as Part,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 32,
    },
  };
  const result = await model.generateContent(req);

  const resp = await result.response;
  // Try to find inline image data with mime type
  type RespPart = { inlineData?: { data?: string; mimeType?: string }; fileData?: { data?: string; mimeType?: string }; media?: unknown; blob?: unknown };
  type RespShape = { candidates?: Array<{ content?: { parts?: Array<RespPart> } }>; };
  const respAny = resp as unknown as RespShape;
  const parts: RespPart[] = respAny?.candidates?.[0]?.content?.parts ?? [];
  const inlinePart = parts.find((p) => p?.inlineData);
  const data = inlinePart?.inlineData?.data as string | undefined;
  const mime = inlinePart?.inlineData?.mimeType as string | undefined;
  if (!data) {
    // Some SDKs expose images via alternate fields
    const media = parts.find((p) => p?.fileData || p?.media || p?.blob);
    const alt = media?.fileData?.data as string | undefined;
    if (alt) return { data: alt } as const;
    throw new Error("No image in Gemini response");
  }
  return { data, mime } as const
}

async function generateWithFailover(
  prompt: string,
  img1: File,
  img2: File,
  seed: number
): Promise<{ data: string; mime?: string }> {
  const keys = getKeys();
  let lastErr: unknown;
  for (const key of keys) {
    for (const modelName of MODEL_NAMES) {
      try {
        return await generateOne(prompt, img1, img2, seed, key, modelName);
      } catch (err: unknown) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        // If rate/quota/billing → try next key (break inner)
        if (/quota|billing|exceed|rate|429|402|403/i.test(msg)) {
          break; // break inner for next key
        }
        // If model issue → try next model
        if (/model|not\s*found|unsupported|invalid/i.test(msg)) {
          continue; // next modelName
        }
        // Non-retryable
        throw (err instanceof Error ? err : new Error("Gemini generation failed"));
      }
    }
  }
  throw (lastErr instanceof Error ? lastErr : new Error("Gemini generation failed"));
}

function withTimeout<T>(p: Promise<T>, ms: number, label = "operation"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

validateEnv();

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const img1 = form.get("partner1") as File | null;
    const img2 = form.get("partner2") as File | null;
    const styleId = String(form.get("styleId") || "");

    if (!img1 || !img2) {
      return Response.json({ error: "Both partner images are required." }, { status: 400 });
    }
    if (!ACCEPTED_TYPES.has(img1.type) || !ACCEPTED_TYPES.has(img2.type)) {
      return Response.json({ error: "Only JPG, PNG, or WebP files are allowed." }, { status: 400 });
    }
    if (img1.size > MAX_SIZE || img2.size > MAX_SIZE) {
      return Response.json({ error: "Each file must be ≤ 5MB." }, { status: 400 });
    }

    const style = STYLE_MAP[styleId];
    if (!style) {
      return Response.json({ error: "Invalid style selected." }, { status: 400 });
    }

    const basePrompt = style.prompt;

    // DEMO mode: return placeholder images to allow full UX testing without billing/quota.
    if (DEMO_MODE) {
      const images = Array.from({ length: 10 }, (_, i) => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'>\n  <defs>\n    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>\n      <stop offset='0%' stop-color='#fde68a'/>\n      <stop offset='100%' stop-color='#fca5a5'/>\n    </linearGradient>\n  </defs>\n  <rect width='100%' height='100%' fill='url(#g)'/>\n  <text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='36' font-family='Inter, sans-serif' fill='#111'>AI Pre-Wedding</text>\n  <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='20' font-family='Inter, sans-serif' fill='#111'>${style.title} • ${i + 1}/10</text>\n</svg>`;
        const b64 = Buffer.from(svg).toString('base64');
        return { id: i + 1, dataUrl: `data:image/svg+xml;base64,${b64}` };
      });
      return Response.json({ images });
    }

    // Generate exactly 10 images; run in parallel with modest concurrency.
    const seeds = Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * 1e9) + i);

    const queue = [...seeds];
    const results: { data: string; mime?: string }[] = [];
    const MAX_CONCURRENCY = 2; // conservative to reduce rate-limit risk

    async function worker() {
      while (queue.length) {
        const seed = queue.shift()!;
        const imgB64 = await generateWithFailover(basePrompt, img1 as File, img2 as File, seed);
        results.push(imgB64);
      }
    }

    const workers = Array.from({ length: MAX_CONCURRENCY }, () => worker());

    await withTimeout(Promise.all(workers), 90_000, "generation");

    // Return data URLs to the client, preserving mime when available
    const images = results.map((r, idx) => ({ id: idx + 1, dataUrl: `data:${r.mime ?? 'image/png'};base64,${r.data}` }));
    return Response.json({ images });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const isQuota = /quota|429|rate|exceed|free_tier|billing|RESOURCE_EXHAUSTED/i.test(message);
    const status = isQuota ? 429 : 500;
    const friendly = isQuota
      ? "Quota or access exceeded for the selected Gemini model. Please enable billing in Google AI Studio, try again later, or set DEMO_MODE=1 to simulate results."
      : message;
    return Response.json({ error: friendly }, { status });
  }
}

