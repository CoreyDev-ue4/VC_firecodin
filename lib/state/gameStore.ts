"use client";

import { create } from "zustand";
import * as THREE from "three";
import { PowerupId } from "@/lib/constants/powerups";

interface Vector2D {
  x: number;
  z: number;
}

interface GameState {
  time: number;
  oxygen: number;
  water: number;
  score: number;
  civiliansRescued: number;
  difficultyLevel: number;
  velocity: Vector2D;
  activePowerups: Record<PowerupId, number>;
  loopStarted: boolean;
  startLoop: () => void;
  tick: (delta: number) => void;
  applyPowerup: (id: PowerupId, duration: number | null) => void;
  adjustResources: (changes: Partial<Pick<GameState, "oxygen" | "water" | "score">>) => void;
}

const BASE_DEPLETION_OXYGEN = 2.4;
const BASE_DEPLETION_WATER = 1.5;

export const useGameLoop = create<GameState>((set, get) => ({
  time: 0,
  oxygen: 100,
  water: 100,
  score: 0,
  civiliansRescued: 0,
  difficultyLevel: 1,
  velocity: { x: 0, z: 0 },
  activePowerups: {
    adrenaline: 0,
    pressure: 0,
    thermal: 0,
    oxygen: 0,
    water: 0,
    gel: 0,
    timePulse: 0
  },
  loopStarted: false,
  startLoop: () => {
    if (typeof window === "undefined") return;
    if (get().loopStarted) return;
    set({ loopStarted: true });
    let last = performance.now();

    const step = () => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;
      get().tick(delta);
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  },
  tick: (delta) => {
    set((state) => {
      const oxygenDrainMultiplier = state.activePowerups.adrenaline > 0 ? 1.1 : 1;
      const waterDrainMultiplier = state.activePowerups.pressure > 0 ? 2 : 1;
      const gelPenalty = state.activePowerups.gel > 0 ? 0.7 : 1;

      const nextTime = state.time + delta;
      const nextDifficulty = Math.min(10, 1 + Math.floor(nextTime / 60));
      const oxygenDrain = BASE_DEPLETION_OXYGEN * delta * nextDifficulty * oxygenDrainMultiplier;
      const waterDrain = BASE_DEPLETION_WATER * delta * (1 + nextDifficulty * 0.15) * waterDrainMultiplier;

      const nextOxygen = Math.max(0, state.oxygen - oxygenDrain);
      const nextWater = Math.max(0, state.water - waterDrain);

      const updatedPowerups = Object.fromEntries(
        Object.entries(state.activePowerups).map(([key, value]) => [key, Math.max(0, value - delta)])
      ) as GameState["activePowerups"];

      const milestoneReached = Math.floor(nextTime / 15) > Math.floor(state.time / 15);

      return {
        time: nextTime,
        difficultyLevel: nextDifficulty,
        oxygen: nextOxygen,
        water: nextWater,
        velocity: {
          x: THREE.MathUtils.damp(state.velocity.x, gelPenalty * 0.4 * Math.sin(nextTime), 2.5, delta),
          z: THREE.MathUtils.damp(state.velocity.z, gelPenalty * 0.8 * Math.cos(nextTime), 2.5, delta)
        },
        activePowerups: updatedPowerups,
        score: milestoneReached ? state.score + 12 * nextDifficulty : state.score
      } as Partial<GameState>;
    });
  },
  applyPowerup: (id, duration) => {
    set((state) => ({
      activePowerups: {
        ...state.activePowerups,
        [id]: duration ?? 0
      }
    }));

    if (id === "oxygen") {
      set((state) => ({ oxygen: Math.min(100, state.oxygen + 50) }));
    }

    if (id === "water") {
      set((state) => ({ water: Math.min(100, state.water + 40) }));
    }
  },
  adjustResources: (changes) => {
    set((state) => ({
      oxygen:
        changes.oxygen !== undefined
          ? Math.max(0, Math.min(100, state.oxygen + changes.oxygen))
          : state.oxygen,
      water:
        changes.water !== undefined
          ? Math.max(0, Math.min(100, state.water + changes.water))
          : state.water,
      score: changes.score !== undefined ? Math.max(0, state.score + changes.score) : state.score
    }));
  }
}));

// Provide typed re-export for clarity in UI components
export type { GameState };
