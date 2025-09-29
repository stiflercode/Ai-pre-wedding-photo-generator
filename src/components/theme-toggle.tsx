"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      const dark = t ? t === "dark" : false;
      setIsDark(dark);
    } catch {}
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) root.classList.add("dark"); else root.classList.remove("dark");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={toggle}>
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}

