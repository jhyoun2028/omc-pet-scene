# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pixel-art interactive scene showing Claude Code mascot figures sitting at desks. Switching OMC modes spawns/despawns specialized agent figures. Ships as both a **VS Code extension** (panel webview) and a **standalone Vite dev app**.

## Three Runtime Modes

The same `omc-pet-scene.jsx` is loaded three different ways. When editing the scene, keep in mind that **all three hosts ingest the raw `.jsx` file via the same transform**: strip `^import ...;` lines, rewrite `^export default ` → `const OMCScene = `, then evaluate under Babel standalone + React 18 UMD from unpkg. New top-level imports or a different default-export shape will break the extension and Electron overlays silently.

1. **VS Code extension** (`extension.js`) — reads `omc-pet-scene.jsx`, applies the transform, injects into a webview view registered as panel `omcPet.view` (bottom bar, next to Terminal). Uses `retainContextWhenHidden: true`. Posts agent count + project info into the webview.
2. **Standalone Vite dev** (`main.jsx` + `index.html` + `vite.config.js`) — ES module import, rendered full-screen over `#0a0a1a` body bg.
3. **Electron overlay** — two copies exist: `overlay.js` (root, driven by `npm run overlay`) and `overlay-app/main.js` (standalone project with its own `package.json`). Both create a transparent, click-through, always-on-top window in the bottom-right of the primary display. The root `overlay.js` sets `focusable: false`; `overlay-app/` is a slightly older/smaller variant. If you touch overlay code, update both unless consolidating.

## Development

No lint or test pipeline. No TypeScript.

- **Standalone dev server:** `npm run dev` (Vite)
- **Electron overlay:** `npm run overlay` (requires `electron` devDep, already installed)
- **Extension testing:** open this folder in VS Code → Run & Debug (F5) → the "Pets" panel appears in the bottom bar
- **Package extension:** `npx @vscode/vsce package` produces a `.vsix`. `.vscodeignore` controls what ships; the repo has many throwaway PNG iteration artifacts at the root, so verify the `.vsix` payload before publishing.

## Hard Constraints

- **Single file only** — all CSS inline or Tailwind utility classes, all components in one `.jsx`
- **SVG rects for pixel art** — no `<path>`, no smooth curves on characters
- No canvas, no images, no external dependencies beyond React (`useState`, `useEffect`, `useCallback`)
- No localStorage/sessionStorage (not supported in Claude.ai artifacts)
- No fetch calls, no file I/O — pure visual toy
- All animation via React state + `setInterval`, not CSS animation
- Mode buttons must be real `<button>` elements

## Architecture

**Files:** `omc-pet-scene.jsx` is the scene (all components, inline styles, ~700 lines). `extension.js` is the VS Code extension host that wraps it in a webview. `main.jsx` + `index.html` + `vite.config.js` are the standalone dev harness. `overlay.js` and `overlay-app/main.js` are Electron hosts.

**Extension ↔ Scene messaging:** `extension.js` posts three message types to the webview; the scene listens via `window.addEventListener("message", ...)`:
- `{ type: "setMode", modeIdx }` — switch mode button (keeps mode-based agent count)
- `{ type: "setAgentCount", count }` — override agent count independently of mode (set to `null` to revert to mode-based count)
- `{ type: "projectName", name }` — display in HUD
- `{ type: "projectTasks", tasks: string[] }` — stored in React state (`projectTasks`); the task-rotation effect depends on this, so bubbles refresh immediately when the extension pushes new activity (no 5s lag). The extension already orders tasks by recency (active editor → dirty → saved → opened → git diff), so agent `i` deterministically gets `tasks[i]`, slowly rotating only when there are more tasks than agents

**Extension auto-detection (extension.js):** agent count is derived from `max(claudeTerminals, min(systemProcessCount, 8))`, bumped by edit velocity (≥8 edits in 5s adds one), capped at 9. System process count uses `ps aux | grep -iE '(claude|anthropic|subagent|ccagent)'`. Claude terminals match name substrings: `claude`, `agent`, `task`, `mcp`, `subagent`, `executor`. Project tasks are synthesized from active editor, dirty docs, recent saves (30s window), recent opens (60s), `git diff --name-only HEAD`, and Claude-named terminals. `detectAgents` + `sendProjectInfo` run on a 3s interval plus document/editor/terminal events.

**Animation:** One `setInterval(100ms)` increments a `tick` counter. All animation is a pure function of `tick`.

**SVG coordinate system:** `viewBox="0 0 700 400"`. Figures ~40px wide. Desk at y=280. HUD at y=0. Task bubbles at y=80-100.

**State:** `tick` (frame counter), `modeIdx` (active mode), `agentCount` (explicit override from extension, `null` means "use mode count"), `agentTasks` (agent index to task string), `sparkles` (active particles), `projectName`. Effective agent count is `agentCount ?? modes[modeIdx].count` — the extension and the mode buttons can disagree, and the extension wins until the user clicks a mode button (which resets `agentCount` to `null`).

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
