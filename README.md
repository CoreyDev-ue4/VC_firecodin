# Firefighter: Inferno Run

An endless 3D firefighting survival prototype built with **Next.js**, **React Three Fiber**, **GSAP**, **TailwindCSS**, and **Zustand**. The experience emulates high-pressure rescue scenarios where the player balances oxygen, water, and powerups while navigating hazardous fire zones.

## Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to explore the scene.

## Project Structure

- `app/` – App Router entry with layout, global styles, and the main game shell.
- `components/scene/` – Three.js powered scene composition for the inferno arena and key set pieces.
- `components/ui/` – HUD and overlay UI components rendered above the 3D scene.
- `lib/state/` – Zustand game loop store handling timers, vitals, and powerup durations.
- `lib/constants/` – Gameplay balancing tables such as the powerup catalog.

## Gameplay Systems Overview

- **Vitals Loop** – Oxygen and water drain over time with multipliers linked to difficulty scaling and powerup side-effects.
- **Dynamic Difficulty** – Difficulty tiers increase every 60 seconds, intensifying vitals drain and updating the HUD.
- **Powerup Hooks** – Core powerups from the PRD are surfaced with timers, HUD indicators, and direct vitals adjustments.
- **Cinematic Presentation** – Fire and smoke layers, emissive lighting, and a stylized HUD mirror the desired cinematic realism.

The current build focuses on the MVP loop described in the PRD and serves as a foundation for expanding toward full gameplay, procedural level generation, and backend integrations.
