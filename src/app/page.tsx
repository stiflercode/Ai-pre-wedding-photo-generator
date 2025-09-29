"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { STYLES } from "@/lib/styles";
import dynamic from "next/dynamic";
const HeroGeometric = dynamic(() => import("@/components/ui/shape-landing-hero").then(m => m.SafeHeroGeometric), {
  ssr: false,
  loading: () => <div className="h-[70vh] w-full bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5" aria-hidden="true" />,
});
import Script from "next/script";

const MAX_MB = 5;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const [p1, setP1] = useState<File | null>(null);
  const [p2, setP2] = useState<File | null>(null);
  const [styleId, setStyleId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<{ id: number; dataUrl: string }[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<0 | 1 | 2>(0);
  const abortRef = useRef<AbortController | null>(null);

  const canGenerate = !!p1 && !!p2 && !!styleId && !generating;

  const onFile = (file: File | null, who: 1 | 2) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) { alert("Only JPG/PNG/WebP allowed."); return; }
    if (file.size > MAX_MB * 1024 * 1024) { alert("Max 5MB per file."); return; }
    (who === 1 ? setP1 : setP2)(file);
    setError(null);
  };

  const remove = (who: 1 | 2) => (who === 1 ? setP1(null) : setP2(null));

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !p1 || !p2) return;
    setGenerating(true);
    setError(null);
    setProgress(5);
    setImages([]);
    const fd = new FormData();
    fd.append("partner1", p1);
    fd.append("partner2", p2);
    fd.append("styleId", styleId);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/generate", { method: "POST", body: fd, signal: ac.signal });
      type Payload = { images?: { id:number; dataUrl:string }[]; error?: string };
      const payload: Payload = await res.json().catch(() => ({} as Payload));
      if (!res.ok) throw new Error(payload.error || "Generation failed");
      setProgress(65);
      setImages(payload.images || []);
      setProgress(100);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
    } finally {
      setGenerating(false);
      abortRef.current = null;
      setTimeout(() => setProgress(0), 800);
    }
  }, [canGenerate, p1, p2, styleId]);

  const getMimeAndExt = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mime = match?.[1] || "image/png";
    const ext = mime === "image/svg+xml" ? "svg" : mime.split("/")[1]?.replace("jpeg","jpg") || "png";
    return { mime, ext };
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    images.forEach((img, i) => {
      const { ext } = getMimeAndExt(img.dataUrl);
      const b64 = img.dataUrl.split(",")[1];
      zip.file(`ai-prewedding-${i + 1}.${ext}`, b64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "ai-prewedding-photoshoot.zip");
  };

  const downloadOne = async (img: { id: number; dataUrl: string }) => {
    const { ext } = getMimeAndExt(img.dataUrl);
    const blob = await (await fetch(img.dataUrl)).blob();
    saveAs(blob, `ai-prewedding-${img.id}.${ext}`);
  };

  const reset = () => {
    setP1(null); setP2(null); setStyleId(""); setImages([]); setPreview(null);
  };

  return (
    <div className="font-sans min-h-dvh">
      {/* Hero section below the site header */}
      <section aria-label="hero">
        <HeroGeometric badge="AI Pre‑Wedding" title1="AI Pre‑Wedding" title2="Photoshoot Generator" />
      </section>
      <Script id="hero-structured-data" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'AI Pre‑Wedding Photoshoot Generator',
          url: '/',
          description: 'Upload two photos, pick a style, and generate 10 romantic AI pre‑wedding images.',
          publisher: { '@type': 'Organization', name: 'AI Pre‑Wedding' }
        })}
      </Script>
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">AI Pre-Wedding Photoshoot</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload two photos, pick a style, and generate 10 romantic images.</p>
        </header>

        {/* Uploads */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{label:"Partner 1",file:p1,set:(f:File)=>onFile(f,1),remove:()=>remove(1)},{label:"Partner 2",file:p2,set:(f:File)=>onFile(f,2),remove:()=>remove(2)}].map((u,idx)=> (
            <Card key={idx}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{u.label}</CardTitle></CardHeader>
              <CardContent>
                {!u.file ? (
                  <label
                      className={"block cursor-pointer rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground transition " + (dragOver=== (idx+1 as 1|2)?"bg-accent/60 ring-2 ring-primary":"hover:bg-muted/40")}
                      onDragOver={(e)=>{e.preventDefault(); setDragOver((idx+1) as 1|2);}}
                      onDragLeave={()=>setDragOver(0)}
                      onDrop={(e)=>{ e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) u.set(f); setDragOver(0); }}
                    >
                    <Input data-testid={`file-input-${idx+1}`} type="file" className="hidden" accept={ACCEPT.join(",")} onChange={(e)=>{ const f = (e.target as HTMLInputElement).files?.[0]; if (f) u.set(f); }} />
                    Drop or click to upload (JPG/PNG/WebP, 5MB). For best results, use clear, forward-facing, well-lit photos showing the full face.
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image src={URL.createObjectURL(u.file)} alt={u.label} fill className="object-cover" unoptimized />
                    </div>
                    <div className="text-sm flex-1 truncate">{u.file.name}</div>
                    <Button variant="secondary" onClick={u.remove}>Remove</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Styles */}
        <section className="mt-6">
          <h2 className="text-lg font-medium mb-3">Choose a style</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STYLES.map((s)=> (
              <Card key={s.id} className={"cursor-pointer transition relative " + (styleId===s.id?"ring-2 ring-primary shadow-sm":" hover:bg-muted/40")}
                data-testid="style-card"
                onClick={()=>setStyleId(s.id)}>
                <CardContent className="p-0">
                  <AspectRatio ratio={4/3}>
                    <Image src={s.preview} alt={s.title} fill className="object-cover rounded-t-md" />
                  </AspectRatio>
                  {styleId===s.id && (
                    <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground rounded px-1.5 py-0.5">Selected</span>
                  )}
                </CardContent>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm font-medium truncate">{s.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="mt-6 flex items-center gap-3">
          <Button onClick={handleGenerate} disabled={!canGenerate}>
            {generating?"Generating...":"Generate My Photoshoot"}
          </Button>
          {generating && (
            <div className="flex items-center gap-2 w-64">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{progress}%</span>
            </div>
          )}
        </section>

        {error && (
          <div className="mt-3 text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive p-3">
            {error}
          </div>
        )}

        {/* Results */}
        {images.length>0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium">Results ({images.length})</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={downloadAll}>Download All as ZIP</Button>
                <Button size="sm" variant="outline" onClick={reset}>Create Another</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {images.map((img)=> (
                <Card key={img.id} className="overflow-hidden" data-testid="result-card">
                  <div className="relative">
                    <AspectRatio ratio={4/5}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.dataUrl} alt={`Generated ${img.id}`} className="h-full w-full object-cover" onClick={()=>setPreview(img.dataUrl)} />
                    </AspectRatio>
                  </div>
                  <CardContent className="p-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">#{img.id}</span>
                    {(() => { const { ext } = getMimeAndExt(img.dataUrl); return (
                      <a href={img.dataUrl} download={`ai-prewedding-${img.id}.${ext}`} className="text-xs underline">Download</a>
                    ); })()}

                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Dialog open={!!preview} onOpenChange={()=>setPreview(null)}>
          <DialogContent className="max-w-3xl">
            {preview && (
              <div className="relative w-full">
                <AspectRatio ratio={4/5}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                </AspectRatio>
                <div className="mt-3 flex justify-end">
                  <button className="text-sm underline" onClick={() => setPreview(null)}>Close</button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
