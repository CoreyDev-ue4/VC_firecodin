# Firefighter: Inferno Run

A fast-loading 2D firefighting survival prototype that runs entirely in the browser. The experience was rebuilt to ditch heavy 3D
assets and fragile tooling so you can jump straight into play from any machine.

## Play It Now

### Option 1 – Next.js dev server (Mac, Linux, Windows)

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The dev server powers hot reload, but everything renders client-side so
once the page loads you can even disconnect from the network.

### Option 2 – Zero-install offline build

Open `offline/firefighter-arcade.html` directly in any modern browser. It ships with the same 2D canvas gameplay loop and requires
no npm install, Node.js, or internet connection.

### Windows helper (optional)

`play-inferno-run.bat` will attempt to start the Next.js dev server and, if that fails, will fall back to launching the offline
HTML build automatically.

## Controls & Loop

- **Move** – WASD or Arrow Keys
- **Spray Hose** – Space or **J**
- **Goal** – Stay alive, clear fires, and rescue civilians to keep oxygen and water topped off.

As you survive, fire spawns accelerate and your vitals drain faster. Colliding with a blaze hurts health, and staying near heat
reduces oxygen. Spraying water clears nearby fires but consumes your tank, so time your bursts.

## Project Structure

- `app/` – App Router entry and styling for the React experience.
- `components/game/` – Canvas-powered game implementation.
- `offline/` – Standalone HTML export that mirrors the game for environments without Node.js.
- `public/` – Manifest and shared assets.
- `tailwind.config.js` – Utility styling for HUD polish.

## FAQ

### Why does it still run on localhost?

Running `npm run dev` spins up the Next.js development server locally to provide hot reloading and fast iteration. The actual game
logic executes entirely in your browser, so there is no multiplayer or remote server dependency.

### Is multiplayer supported?

No. This build focuses on a single-player endless survival loop with light resource management.

## Technical Notes

- The new game loop is written with plain Canvas 2D APIs—no WebGL, Three.js, or extra runtime dependencies.
- HUD state is throttled so React only re-renders a few times a second, keeping performance consistent even on low-end laptops.
- Both the React and offline builds share the same feel, making it easy to test balancing changes without recompiling.
