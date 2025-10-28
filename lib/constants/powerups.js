export const POWERUPS = [
  {
    id: "adrenaline",
    name: "Adrenaline Shot",
    description: "Boosts speed by 25% while increasing oxygen drain.",
    duration: 15,
    tint: "#ff4b1f"
  },
  {
    id: "pressure",
    name: "Pressure Surge",
    description: "Doubles hose pressure at the cost of water usage.",
    duration: 10,
    tint: "#ff2d55"
  },
  {
    id: "thermal",
    name: "Thermal Vision",
    description: "Highlights civilians and hotspots through smoke.",
    duration: 20,
    tint: "#ffd166"
  },
  {
    id: "oxygen",
    name: "Oxygen Boost",
    description: "Replenishes 50% of the oxygen supply.",
    duration: null,
    tint: "#6fffe9"
  },
  {
    id: "water",
    name: "Water Capsule",
    description: "Recharges 40% of the water tank.",
    duration: null,
    tint: "#29b6f6"
  },
  {
    id: "gel",
    name: "Fireproof Gel",
    description: "Provides heat immunity but slows movement.",
    duration: 10,
    tint: "#f4a261"
  },
  {
    id: "timePulse",
    name: "Time Pulse",
    description: "Slows fire spread briefly with a long cooldown.",
    duration: 5,
    tint: "#b388ff"
  }
];

export function usePowerupCatalog() {
  return POWERUPS;
}

export function formatPowerupTimer(timer) {
  return `${Math.max(0, timer).toFixed(0)}s`;
}
