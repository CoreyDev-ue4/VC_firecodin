"use client";

import { FireRun2DGame } from "@/components/game/FireRun2DGame";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-black via-[#12060c] to-black text-white">
      <section className="flex flex-1 items-center justify-center">
        <FireRun2DGame />
      </section>
      <footer className="flex items-center justify-between px-8 py-6 text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        <span>Firefighter: Inferno Run</span>
        <span>Hold the line.</span>
      </footer>
    </main>
  );
}
