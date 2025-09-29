import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Pre‑Wedding Photoshoot Generator",
  description:
    "Upload two photos, pick a style, and generate 10 romantic AI pre‑wedding images.",
  metadataBase: new URL("http://localhost:3002"),
  openGraph: {
    title: "AI Pre‑Wedding Photoshoot Generator",
    description: "Upload two photos, pick a style, and generate 10 romantic AI pre‑wedding images.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pre‑Wedding Photoshoot Generator",
    description: "Upload two photos, pick a style, and generate 10 romantic AI pre‑wedding images.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-dvh bg-background text-foreground`}>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="font-semibold tracking-tight">AI Pre‑Wedding</div>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
