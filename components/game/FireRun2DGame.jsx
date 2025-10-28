"use client";

import { useEffect, useRef, useState } from "react";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 54;
const PLAYER_SPEED = 320;
const FIRE_SPAWN_INTERVAL = 0.9;
const CIVILIAN_SPAWN_INTERVAL = 2.8;
const MAX_FIRES = 12;
const SPRAY_RANGE = 96;
const SPRAY_WIDTH = 64;
const HUD_UPDATE_INTERVAL = 0.15;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createPlayer() {
  return {
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 24,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0
  };
}

function createFire(seed) {
  return {
    x: 96 + Math.random() * (GAME_WIDTH - 192),
    y: -80,
    radius: 26 + Math.random() * 18,
    speed: 120 + seed * 8 + Math.random() * 25,
    heat: 12 + Math.random() * 6
  };
}

function createCivilian() {
  return {
    x: 120 + Math.random() * (GAME_WIDTH - 240),
    y: -40,
    width: 26,
    height: 40,
    speed: 80 + Math.random() * 25
  };
}

function circlesOverlap(ax, ay, aradius, bx, by, bradius) {
  const dx = ax - bx;
  const dy = ay - by;
  const distanceSq = dx * dx + dy * dy;
  const radiusSum = aradius + bradius;
  return distanceSq <= radiusSum * radiusSum;
}

function rectsOverlap(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

export function FireRun2DGame() {
  const canvasRef = useRef(null);
  const startGameRef = useRef(() => {});
  const [phase, setPhase] = useState("intro");
  const [hud, setHud] = useState({
    score: 0,
    time: 0,
    oxygen: 100,
    water: 100,
    health: 100,
    rescues: 0
  });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const input = {
      left: false,
      right: false,
      up: false,
      down: false,
      spray: false
    };

    const gameState = {
      player: createPlayer(),
      fires: [],
      civilians: [],
      time: 0,
      score: 0,
      rescues: 0,
      oxygen: 100,
      water: 100,
      health: 100,
      spawnTimer: 0,
      civilianTimer: 0,
      hudTimer: 0,
      difficulty: 0,
      running: false,
      lastTime: 0
    };

    function resetState() {
      gameState.player = createPlayer();
      gameState.fires = [];
      gameState.civilians = [];
      gameState.time = 0;
      gameState.score = 0;
      gameState.rescues = 0;
      gameState.oxygen = 100;
      gameState.water = 100;
      gameState.health = 100;
      gameState.spawnTimer = 0;
      gameState.civilianTimer = 0;
      gameState.hudTimer = 0;
      gameState.difficulty = 0;
    }

    function handleKeyDown(event) {
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          input.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          input.right = true;
          break;
        case "ArrowUp":
        case "KeyW":
          input.up = true;
          break;
        case "ArrowDown":
        case "KeyS":
          input.down = true;
          break;
        case "Space":
        case "KeyJ":
          input.spray = true;
          event.preventDefault();
          break;
        default:
          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          input.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          input.right = false;
          break;
        case "ArrowUp":
        case "KeyW":
          input.up = false;
          break;
        case "ArrowDown":
        case "KeyS":
          input.down = false;
          break;
        case "Space":
        case "KeyJ":
          input.spray = false;
          break;
        default:
          break;
      }
    }

    function updatePlayer(dt) {
      const player = gameState.player;
      player.vx = 0;
      player.vy = 0;

      if (input.left) player.vx -= 1;
      if (input.right) player.vx += 1;
      if (input.up) player.vy -= 1;
      if (input.down) player.vy += 1;

      const magnitude = Math.hypot(player.vx, player.vy);
      if (magnitude > 0) {
        player.vx = (player.vx / magnitude) * PLAYER_SPEED;
        player.vy = (player.vy / magnitude) * PLAYER_SPEED;
      }

      player.x = clamp(player.x + player.vx * dt, 80, GAME_WIDTH - 80 - player.width);
      player.y = clamp(player.y + player.vy * dt, 120, GAME_HEIGHT - 48 - player.height);
    }

    function updateFires(dt) {
      gameState.spawnTimer += dt;
      gameState.difficulty += dt * 0.15;
      const spawnInterval = Math.max(0.35, FIRE_SPAWN_INTERVAL - gameState.difficulty * 0.03);

      if (gameState.spawnTimer >= spawnInterval && gameState.fires.length < MAX_FIRES) {
        gameState.spawnTimer = 0;
        gameState.fires.push(createFire(gameState.time));
      }

      gameState.fires.forEach((fire) => {
        fire.y += fire.speed * dt;
        fire.speed += dt * 6;
      });

      gameState.fires = gameState.fires.filter((fire) => fire.y < GAME_HEIGHT + fire.radius);
    }

    function updateCivilians(dt) {
      gameState.civilianTimer += dt;
      if (gameState.civilianTimer >= CIVILIAN_SPAWN_INTERVAL) {
        gameState.civilianTimer = 0;
        gameState.civilians.push(createCivilian());
      }

      gameState.civilians.forEach((civilian) => {
        civilian.y += civilian.speed * dt;
      });

      gameState.civilians = gameState.civilians.filter(
        (civilian) => civilian.y < GAME_HEIGHT + civilian.height
      );
    }

    function updateResources(dt) {
      gameState.time += dt;
      gameState.oxygen = clamp(gameState.oxygen - dt * 6, 0, 100);

      if (input.spray && gameState.water > 0) {
        gameState.water = clamp(gameState.water - dt * 28, 0, 100);
        gameState.score += dt * 4;
      } else {
        gameState.water = clamp(gameState.water + dt * 5, 0, 100);
      }

      const player = gameState.player;
      const baseHeatLoss = 0.0;
      let extraOxygenDrain = 0;

      gameState.fires.forEach((fire) => {
        const distance = Math.hypot(player.x + player.width / 2 - fire.x, player.y - fire.y);
        if (distance < 120) {
          extraOxygenDrain += (120 - distance) * 0.04;
        }
        if (circlesOverlap(player.x + player.width / 2, player.y + player.height / 2, 26, fire.x, fire.y, fire.radius)) {
          gameState.health = clamp(gameState.health - dt * 35, 0, 100);
        }
      });

      gameState.oxygen = clamp(gameState.oxygen - dt * extraOxygenDrain, 0, 100);
      gameState.health = clamp(gameState.health - dt * baseHeatLoss, 0, 100);
    }

    function handleCollisions() {
      const playerRect = {
        x: gameState.player.x,
        y: gameState.player.y,
        width: gameState.player.width,
        height: gameState.player.height
      };

      const sprayActive = input.spray && gameState.water > 1;
      const sprayPoint = {
        x: gameState.player.x + gameState.player.width / 2,
        y: gameState.player.y - 32
      };

      if (sprayActive) {
        const sprayRadius = SPRAY_RANGE;
        gameState.fires = gameState.fires.filter((fire) => {
          if (circlesOverlap(fire.x, fire.y, fire.radius, sprayPoint.x, sprayPoint.y, sprayRadius)) {
            gameState.score += 8;
            return false;
          }
          return true;
        });
      }

      gameState.civilians = gameState.civilians.filter((civilian) => {
        if (rectsOverlap(playerRect, civilian)) {
          gameState.rescues += 1;
          gameState.score += 24;
          gameState.oxygen = clamp(gameState.oxygen + 12, 0, 100);
          gameState.water = clamp(gameState.water + 8, 0, 100);
          return false;
        }
        return true;
      });
    }

    function updateHud(dt) {
      gameState.hudTimer += dt;
      if (gameState.hudTimer >= HUD_UPDATE_INTERVAL) {
        gameState.hudTimer = 0;
        setHud({
          score: Math.round(gameState.score),
          time: gameState.time,
          oxygen: gameState.oxygen,
          water: gameState.water,
          health: gameState.health,
          rescues: gameState.rescues
        });
      }
    }

    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, "#060b14");
      gradient.addColorStop(1, "#150307");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#f2a766";
      for (let i = 0; i < GAME_WIDTH; i += 80) {
        ctx.fillRect(i, 0, 4, GAME_HEIGHT);
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 2;
      for (let y = 120; y < GAME_HEIGHT; y += 48) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(GAME_WIDTH - 60, y + 16);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPlayer() {
      const player = gameState.player;
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.fillStyle = "#3ec5ff";
      ctx.shadowColor = "#3ec5ff";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      drawRoundedRect(
        ctx,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
        10
      );
      ctx.fill();
      ctx.restore();
    }

    function drawFires() {
      ctx.save();
      gameState.fires.forEach((fire) => {
        const gradient = ctx.createRadialGradient(fire.x, fire.y, fire.radius * 0.2, fire.x, fire.y, fire.radius);
        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(0.4, "#ffb347");
        gradient.addColorStop(1, "rgba(255, 56, 0, 0.8)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawCivilians() {
      ctx.save();
      ctx.shadowColor = "#ffeea8";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffeea8";
      gameState.civilians.forEach((civilian) => {
        ctx.beginPath();
        drawRoundedRect(ctx, civilian.x, civilian.y, civilian.width, civilian.height, 8);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawSpray() {
      if (!(input.spray && gameState.water > 1)) {
        return;
      }
      const player = gameState.player;
      const baseX = player.x + player.width / 2;
      const baseY = player.y;
      ctx.save();
      ctx.globalAlpha = 0.8;
      const gradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY - SPRAY_RANGE);
      gradient.addColorStop(0, "rgba(78, 206, 255, 0.5)");
      gradient.addColorStop(1, "rgba(148, 241, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(baseX - SPRAY_WIDTH / 2, baseY);
      ctx.lineTo(baseX + SPRAY_WIDTH / 2, baseY);
      ctx.lineTo(baseX + 12, baseY - SPRAY_RANGE);
      ctx.lineTo(baseX - 12, baseY - SPRAY_RANGE);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawOverlay() {
      ctx.save();
      ctx.fillStyle = "rgba(8, 8, 12, 0.24)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.restore();
    }

    function drawFrame() {
      drawBackground();
      drawFires();
      drawCivilians();
      drawSpray();
      drawPlayer();
      drawOverlay();
    }

    function checkEndState() {
      if (gameState.health <= 0 || gameState.oxygen <= 0) {
        gameState.running = false;
        setPhase("complete");
        setSummary({
          score: Math.round(gameState.score),
          time: gameState.time,
          rescues: gameState.rescues,
          firesCleared: MAX_FIRES * 2 - gameState.fires.length
        });
      }
    }

    function loop(timestamp) {
      if (!gameState.running) {
        return;
      }

      if (!gameState.lastTime) {
        gameState.lastTime = timestamp;
      }

      const dt = clamp((timestamp - gameState.lastTime) / 1000, 0, 0.12);
      gameState.lastTime = timestamp;

      updatePlayer(dt);
      updateFires(dt);
      updateCivilians(dt);
      updateResources(dt);
      handleCollisions();
      updateHud(dt);
      drawFrame();
      checkEndState();

      if (gameState.running) {
        requestAnimationFrame(loop);
      }
    }

    function startGame() {
      resetState();
      setSummary(null);
      setPhase("running");
      gameState.lastTime = 0;
      gameState.running = true;
      drawBackground();
      requestAnimationFrame(loop);
    }

    startGameRef.current = startGame;
    drawFrame();

    function stopGame() {
      gameState.running = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      stopGame();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const startMission = () => {
    if (startGameRef.current) {
      startGameRef.current();
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-[0.3em] text-orange-200 sm:text-3xl">
          FIREFIGHTER: INFERNO RUN
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
          Survive the blaze, rescue civilians, and manage your oxygen and water. Spray with SPACE or J.
          Move with WASD or arrow keys.
        </p>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="max-h-[70vh] max-w-full rounded-2xl border border-white/10 bg-black shadow-[0_0_60px_rgba(255,90,0,0.18)]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5"></div>
        {phase !== "running" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur">
            <div className="pointer-events-auto flex flex-col items-center gap-4 text-center">
              {phase === "intro" && (
                <>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">Mission Brief</p>
                  <p className="max-w-md text-balance text-base text-white/80">
                    The city is burning. Stay mobile, keep oxygen flowing, and clear a path with your hose. Every
                    rescue buys precious seconds.
                  </p>
                </>
              )}
              {phase === "complete" && summary && (
                <div className="flex flex-col items-center gap-3 text-sm text-white/80">
                  <p className="text-lg font-semibold text-orange-200">Deployment Summary</p>
                  <p>Score: <span className="font-semibold text-white">{summary.score}</span></p>
                  <p>Survival Time: <span className="font-semibold text-white">{summary.time.toFixed(1)}s</span></p>
                  <p>Civilians Rescued: <span className="font-semibold text-white">{summary.rescues}</span></p>
                </div>
              )}
              <button
                type="button"
                onClick={startMission}
                className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 px-6 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-black transition hover:brightness-110"
              >
                {phase === "running" ? "Resume" : "Start Mission"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.25em] text-white/70 sm:grid-cols-3">
        <Stat label="Score" value={hud.score} format={(value) => value.toLocaleString()} />
        <Stat label="Time" value={hud.time} format={(value) => `${value.toFixed(1)}s`} />
        <Stat label="Rescues" value={hud.rescues} />
        <Stat label="Health" value={hud.health} format={(value) => `${Math.round(value)}%`} />
        <Stat label="Oxygen" value={hud.oxygen} format={(value) => `${Math.round(value)}%`} />
        <Stat label="Water" value={hud.water} format={(value) => `${Math.round(value)}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value, format = (val) => val }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-xl bg-black/30 px-4 py-3">
      <span className="text-[0.6rem] text-white/40">{label}</span>
      <span className="text-base font-semibold text-white">
        {typeof value === "number" ? format(value) : value}
      </span>
    </div>
  );
}
