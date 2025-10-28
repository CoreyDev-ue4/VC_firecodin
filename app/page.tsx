"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Hud } from "@/components/ui/Hud";
import { useGameLoop } from "@/lib/state/gameStore";

const InfernoScene = dynamic(
  () => import("@/components/scene/InfernoScene").then((mod) => mod.InfernoScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-lg uppercase tracking-widest text-fire-400">
        Initializing Inferno...
      </div>
    )
  }
);

export default function HomePage() {
  const startLoop = useGameLoop((state) => state.startLoop);

  useEffect(() => {
    startLoop();
  }, [startLoop]);

  return (
    <main className="relative flex min-h-screen flex-col">
      <section className="flex flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-xl font-semibold text-fire-300">
              Synchronizing firefighting gear...
            </div>
          }
        >
          <InfernoScene />
        </Suspense>
      </section>
      <Hud />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-6 text-xs uppercase tracking-[0.3em] text-white/60">
        <span>Firefighter: Inferno Run</span>
        <span>Stay alert. Stay alive.</span>
      </div>
    </main>
  );
}
