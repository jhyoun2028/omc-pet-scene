# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pixel-art interactive scene (single `.jsx` file) showing Claude Code mascot figures sitting at desks. Switching OMC modes spawns/despawns specialized agent figures. Runs as a React artifact on Claude.ai or any React sandbox.

## Development

No build, lint, or test pipeline. The entire app is a single `.jsx` file with no build step. Open it in a Claude.ai artifact or any React sandbox that provides React.

## Hard Constraints

- **Single file only** — all CSS inline or Tailwind utility classes, all components in one `.jsx`
- **SVG rects for pixel art** — no `<path>`, no smooth curves on characters
- No canvas, no images, no external dependencies beyond React (`useState`, `useEffect`, `useCallback`)
- No localStorage/sessionStorage (not supported in Claude.ai artifacts)
- No fetch calls, no file I/O — pure visual toy
- All animation via React state + `setInterval`, not CSS animation
- Mode buttons must be real `<button>` elements

## Architecture

**Animation:** One `setInterval(100ms)` increments a `tick` counter. All animation is a pure function of `tick`.

**SVG coordinate system:** `viewBox="0 0 700 400"`. Figures ~40px wide. Desk at y=280. HUD at y=0. Task bubbles at y=80-100.

**State:** `tick` (frame counter), `modeIdx` (active mode), `agentTasks` (agent index to task string), `sparkles` (active particles).

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
