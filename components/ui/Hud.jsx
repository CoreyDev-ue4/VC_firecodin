"use client";
import { useGameLoop } from "@/lib/state/gameStore";
import { formatPowerupTimer, usePowerupCatalog } from "@/lib/constants/powerups";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function StatBar({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.4em] text-white/60">{label}</span>
      <div className="h-2 w-64 rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: accent }}
        />
      </div>
      <span className="text-sm font-semibold text-white/70">{value.toFixed(0)}%</span>
    </div>
  );
}

function PowerupTag({ name, tint, timer }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]",
        "border border-white/10 bg-black/60"
      )}
      style={{ boxShadow: `0 0 12px ${tint}40` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: tint }} />
      {name}
      {timer !== null && <span className="font-mono text-white/60">{formatPowerupTimer(timer)}</span>}
    </div>
  );
}

export function Hud() {
  const { oxygen, water, score, civiliansRescued, activePowerups, difficultyLevel, time } = useGameLoop((state) => ({
    oxygen: state.oxygen,
    water: state.water,
    score: state.score,
    civiliansRescued: state.civiliansRescued,
    activePowerups: state.activePowerups,
    difficultyLevel: state.difficultyLevel,
    time: state.time
  }));
  const powerups = usePowerupCatalog();

  return (
    <section className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm uppercase tracking-[0.6em] text-white/60">Vitals</h2>
          <StatBar label="Oxygen" value={oxygen} accent="linear-gradient(90deg, #6fffe9, #29c7b3)" />
          <StatBar label="Water" value={water} accent="linear-gradient(90deg, #5cc0ff, #2b8efc)" />
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <span className="text-xs uppercase tracking-[0.5em] text-white/40">Mission Time</span>
          <span className="text-4xl font-black tracking-[0.2em] text-white/90">{time.toFixed(0)}s</span>
          <span className="text-xs uppercase tracking-[0.5em] text-white/40">Difficulty</span>
          <span className="text-2xl font-semibold text-fire-300">Tier {difficultyLevel}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2 text-sm uppercase tracking-[0.4em] text-white/60">
          <span>Score {score.toFixed(0)}</span>
          <span>Civilians Saved {civiliansRescued}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {powerups.map((powerup) => (
            <PowerupTag
              key={powerup.id}
              name={powerup.name}
              tint={powerup.tint}
              timer={activePowerups[powerup.id] && activePowerups[powerup.id] > 0 ? activePowerups[powerup.id] : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
