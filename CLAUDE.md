# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pixel-art interactive scene showing Claude Code mascot figures sitting at desks. Switching OMC modes spawns/despawns specialized agent figures. Ships as both a **VS Code extension** (panel webview) and a **standalone Vite dev app**.

## Runtime Architecture

The scene lives in `omc-pet-scene.jsx`. Vite builds it (with React bundled in) into a single IIFE at `media/omc-webview.js`. Every runtime host loads that same built artifact — no CDN, no runtime Babel, no string-replace transform:

1. **VS Code extension** (`extension.js`) — `resolveWebviewView` emits an HTML shell with a CSP (`script-src 'nonce-...'`, no `'unsafe-inline'`, no network origins) and a single `<script src>` pointing at `media/omc-webview.js` via `webview.asWebviewUri`. Panel view is `omcPet.view` (bottom bar), `retainContextWhenHidden: true`. `localResourceRoots` is clamped to `media/`.
2. **Standalone Vite dev** (`main.jsx` + `index.html` + `vite.config.js`) — plain ES-module dev, `npm run dev`. Source-of-truth for iterating the scene.
3. **Electron overlay** (`overlay.js`, driven by `npm run overlay`) — transparent, click-through, always-on-top window in the bottom-right. Loads `media/omc-overlay.html` which `<script src>`-loads `media/omc-webview.js`. The old standalone `overlay-app/` subproject is not wired to the new bundle; it's vestigial — either remove it or rewire its `main.js` to `loadFile("../media/omc-overlay.html")`.

`vite.config.js` uses `publicDir: "public"` so `public/omc-overlay.html` is copied verbatim into `media/` on every build. `emptyOutDir` is on, so anything hand-written into `media/` will be wiped — author shell HTML under `public/`.

## Development

No lint or test pipeline. No TypeScript.

- **Standalone dev server:** `npm run dev` (Vite)
- **Build webview bundle:** `npm run build` (required before loading the VS Code extension or the Electron overlay — they both load `media/omc-webview.js`)
- **Electron overlay:** `npm run build && npm run overlay`
- **Extension testing:** `npm run build` first, then open this folder in VS Code → Run & Debug (F5) → the "Pets" panel appears in the bottom bar
- **Package extension:** `npm run package` (alias for `vite build && vsce package`). `.vscodeignore` excludes the 100MB of PNG iteration artifacts at the root as well as `omc-pet-scene.jsx` (the source — the shipped `.vsix` only needs `extension.js` + `media/**` + `package.json`).

## Hard Constraints

- **Single file only** — all CSS inline or Tailwind utility classes, all components in one `.jsx`
- **SVG rects for pixel art** — no `<path>`, no smooth curves on characters
- No canvas, no images, no external dependencies beyond React (`useState`, `useEffect`, `useCallback`)
- No localStorage/sessionStorage (not supported in Claude.ai artifacts)
- No fetch calls, no file I/O — pure visual toy
- All animation via React state + `setInterval`, not CSS animation
- Mode buttons must be real `<button>` elements

## Architecture

**Files:** `omc-pet-scene.jsx` is the scene (all components, inline styles, ~800 lines). `extension.js` is the VS Code extension host; it emits a CSP-locked webview HTML shell and points it at `media/omc-webview.js` via `asWebviewUri`. `main.jsx` + `index.html` + `vite.config.js` are the standalone dev harness. `overlay.js` loads `media/omc-overlay.html` via `loadFile`. The build output `media/omc-webview.js` is the runtime bundle (React inlined); `public/omc-overlay.html` is the overlay shell source (Vite copies it to `media/` on build).

**Extension ↔ Scene messaging:** `extension.js` posts three message types to the webview; the scene listens via `window.addEventListener("message", ...)`:
- `{ type: "setMode", modeIdx }` — switch mode button (keeps mode-based agent count)
- `{ type: "setAgentCount", count }` — override agent count independently of mode (set to `null` to revert to mode-based count)
- `{ type: "projectName", name }` — display in HUD
- `{ type: "projectTasks", tasks: string[] }` — stored in React state (`projectTasks`); the task-rotation effect depends on this, so bubbles refresh immediately when the extension pushes new activity (no 5s lag). The extension already orders tasks by recency (active editor → dirty → saved → opened → git diff), so agent `i` deterministically gets `tasks[i]`, slowly rotating only when there are more tasks than agents

**Extension auto-detection (extension.js):** agent count is derived from `max(claudeTerminals, min(systemProcessCount, 8))`, bumped by edit velocity (≥8 edits in 5s adds one), capped at 9. System process count uses `ps aux | grep -iE '(claude|anthropic|subagent|ccagent)'`. Claude terminals match name substrings: `claude`, `agent`, `task`, `mcp`, `subagent`, `executor`. Project tasks are synthesized from active editor, dirty docs, recent saves (30s window), recent opens (60s), `git diff --name-only HEAD`, and Claude-named terminals. `detectAgents` + `sendProjectInfo` run on a 3s interval plus document/editor/terminal events.

**Animation:** One `setInterval(100ms)` increments a `tick` counter. All animation is a pure function of `tick`.

**SVG coordinate system:** `viewBox="0 0 700 400"`. Figures ~40px wide. Desk at y=280. HUD at y=0. Task bubbles at y=80-100.

**State:** `tick` (frame counter), `modeIdx` (active mode), `agentCount` (explicit override from extension, `null` means "use mode count"), `agentTasks` (agent index to task string), `sparkles` (active particles), `projectName`, `projectTasks` (live from extension), `scale` (user zoom 0.5–1.5, 0.25 steps), `hidden` (hide toggle). Effective agent count is `agentCount ?? modes[modeIdx].count` — the extension and the mode buttons can disagree, and the extension wins until the user clicks a mode button (which resets `agentCount` to `null`).

**Click-through discipline:** the scene is designed to be visually overlaid on a host UI (VS Code panel, Electron overlay) without stealing clicks. Every wrapping element explicitly sets `pointer-events: none` (html, body, #root, wrapper div, `<svg>`). **Only** `<button>` elements (the corner size/hide controls) opt back in via `pointer-events: auto`. If you add new interactive elements, set `pointerEvents: "auto"` inline — otherwise they will be silently un-clickable. The SVG's `viewBox` height shrinks from 290 → 180 when only one desk row is active so the transparent bounding box doesn't stretch over the host UI.

## Visual Style

- **Pixel art** — blocky, chunky, retro. No smooth curves on characters.
- **Dark terminal background** — `#0a0a1a` or similar deep navy/black
- **The mascot** — square body, two antenna/ears with round tips, two square dark eyes with white shine pixels, stubby legs. Drawn as SVG rects, not paths.
- **Colors** — each OMC agent role gets a unique color. Autopilot is always the lead, always orange `#E07045`.
- **Aesthetic** — cozy dev workspace. Tiny monitors, coffee mugs, rubber ducks, paper stacks. Everything chunky pixel art.

## Agent Roster (color + role)

| Agent         | Color     | Accent    | Accessory idea     |
|---------------|-----------|-----------|-------------------|
| Autopilot     | `#E07045` | `#C45A32` | Crown              |
| Architect     | `#4A7FBF` | `#3A6399` | Blueprint          |
| Librarian     | `#5BA55B` | `#468946` | Stack of books     |
| Explorer      | `#3BBFBF` | `#2E9999` | Magnifying glass   |
| Oracle        | `#D4A843` | `#B8902E` | Crystal ball       |
| Critic        | `#CF5050` | `#A33E3E` | ✗ stamp            |
| Risk Assessor | `#9B6BBF` | `#7D54A0` | Warning sign       |
| Worker        | `#8BC34A` | `#6FA030` | Hard hat           |
| Validator     | `#00BCD4` | `#0097A7` | Checkmark flag     |

## OMC Modes (controls how many agents appear)

- `/autopilot` — 1 agent (Autopilot only)
- `/deepwork` — 3 agents (Autopilot + Architect + Critic as quality gate)
- `/ultrawork` — 5 agents (max parallelism, sparks flying)
- `/team` — all 9 agents (full bustling workshop)

## Key Behaviors & Animations

- **Idle bob** — gentle sine-wave vertical bounce on all figures
- **Antenna wiggle** — each antenna bobs independently with offset phase
- **Eye blink** — eyes squish to horizontal line every ~40 ticks
- **Typing arms** — small arms alternate left/right extending toward desk
- **Task bubbles** — speech bubble above each figure showing current task text, rotates every few seconds
- **Agent entry** — new figures slide in from the right with a fade when mode changes
- **Sparkles** — small diamond particles float up when agents are working
- **Monitor glow** — tiny screens on desk show scrolling colored lines matching agent color
- **Clauding... indicator** — animated dots in the HUD bar

## Scene Layout

```
┌─────────────────────────────────────────────────┐
│ oh-my-claudecode │ /mode │ agents: N │ tokens    │  ← HUD bar
├─────────────────────────────────────────────────┤
│                                                 │
│       [bubble]  [bubble]  [bubble]              │
│        ╔══╗      ╔══╗      ╔══╗                 │  ← Figures with
│        ║😊║      ║😊║      ║😊║                 │     task bubbles
│        ╚══╝      ╚══╝      ╚══╝                 │
│     ┌──┤  ├──────┤  ├──────┤  ├──┐              │  ← Desk surface
│     │  monitor   monitor   mug   │              │
│     └────────────────────────────┘              │
│                                                 │
│  [ /autopilot ] [ /deepwork ] [ /ultrawork ]    │  ← Mode buttons
│              [ /team ]                          │
└─────────────────────────────────────────────────┘
```

## Component Hierarchy

```
OMCScene (root)
├── HUD — top status bar
├── <svg> scene
│   ├── Desk (scales width to agent count)
│   ├── Monitor × N (one per agent)
│   ├── CoffeeMug (decoration)
│   ├── RubberDuck (decoration)
│   ├── ClaudeFigure × N (one per active agent)
│   └── Sparkle × N (floating particles)
└── Mode buttons (HTML below SVG)
```

## Design Philosophy

Fun > perfection. This is a toy. Make it delightful.
