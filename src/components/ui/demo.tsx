"use client";
import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-10">
      <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold text-center">
        Hero waves are cool
      </p>
      <p className="text-base md:text-lg mt-4 text-white font-normal text-center">
        Leverage the power of canvas to create a beautiful hero section
      </p>
    </WavyBackground>
  );
}

export function DemoHeroGeometric() {
  return (
    <HeroGeometric badge="Kokonut UI" title1="Elevate Your" title2="Digital Vision" />
  );
}
