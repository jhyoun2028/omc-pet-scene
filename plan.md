# plan.md — OMC Pet Scene Build Plan

## Phase 1: Core Figure Sprite ✦ priority: highest

Build the `ClaudeFigure` SVG component that matches the official mascot.

### Tasks

- [ ] **1.1** Draw the body: 32×24 rect with rounded corners, filled with agent color
- [ ] **1.2** Draw the head: 36×20 rect sitting on top of body, same color
- [ ] **1.3** Draw antenna: two vertical rects with round-tip circles at top, using accent color
- [ ] **1.4** Draw eyes: two 6×6 dark rects with 2×2 white shine pixels. Add blink state (squish to 6×2 every ~40 ticks)
- [ ] **1.5** Draw legs: two small rects below body, accent color
- [ ] **1.6** Draw arms: two small rects on sides of body that alternate position for typing animation
- [ ] **1.7** Add idle bob: `Math.sin(tick * 0.15) * 1.5` vertical offset on body+head group
- [ ] **1.8** Add antenna wiggle: independent sine offsets per antenna with phase shift
- [ ] **1.9** Add shadow: subtle ellipse below feet
- [ ] **1.10** Accept `agent` prop (color, accent, name) so we can recolor per role

**Done when:** A single orange Claude figure renders, bobs, blinks, and wiggles antenna.

---

## Phase 2: Desk & Props

Build the workspace environment around the figures.

### Tasks

- [ ] **2.1** `Desk` component: wood-colored rect surface + two leg rects. Width scales with agent count.
- [ ] **2.2** `Monitor` component: tiny dark rect with colored "code lines" inside that shimmer. One per agent.
- [ ] **2.3** `CoffeeMug` component: white rect + handle arc + brown fill + wavy steam lines
- [ ] **2.4** `RubberDuck` component: yellow circle body + head + orange beak + dot eye
- [ ] **2.5** Place props on desk surface — monitors in front of each figure position, mug and duck as decoration

**Done when:** Desk with monitors, mug, and duck renders. Figures sit correctly behind desk.

---

## Phase 3: Task Bubbles & HUD

Add the information layer showing what agents are doing.

### Tasks

- [ ] **3.1** Speech bubble: dark rounded rect above each figure with agent-colored border. Small triangle pointer at bottom.
- [ ] **3.2** Task text: monospace text inside bubble showing current task string, truncated to ~28 chars
- [ ] **3.3** Task rotation: every 5-8 seconds, randomly pick a new task from `TASKS_POOL` for each agent
- [ ] **3.4** Name tag: agent name in small text below the figure's feet
- [ ] **3.5** HUD bar at top: dark rect spanning full width showing: project name, current mode, agent count, token count, "Clauding..." with animated dots
- [ ] **3.6** HUD should show `Opus (1M)` on the right side

**Done when:** Every figure has a rotating task bubble. HUD bar shows live mode info.

---

## Phase 4: Mode Switching & Agent Spawning

The interactive core — switching OMC modes spawns/despawns agents.

### Tasks

- [ ] **4.1** Define mode configs: `/autopilot` (1 agent), `/deepwork` (3), `/ultrawork` (5), `/team` (9)
- [ ] **4.2** Mode buttons below the SVG scene — styled like terminal commands with monospace font
- [ ] **4.3** Active mode button gets highlighted border matching Autopilot orange
- [ ] **4.4** On mode switch: new agents slide in from right with opacity fade (entry animation over ~10 ticks)
- [ ] **4.5** Departing agents are simply removed (no exit animation needed for v1)
- [ ] **4.6** Desk width smoothly adjusts to fit the active agent count
- [ ] **4.7** Monitors spawn/despawn to match active agents

**Done when:** Clicking mode buttons spawns/despawns correct agents with slide-in animation. Desk resizes.

---

## Phase 5: Sparkles & Polish

Visual flair that makes it feel alive.

### Tasks

- [ ] **5.1** `Sparkle` component: tiny diamond (rotated square) that fades and drifts upward
- [ ] **5.2** Spawn sparkles above active agents periodically
- [ ] **5.3** Monitor "glitch" frame: every ~60 ticks, screen flashes briefly
- [ ] **5.4** Add body detail pixels: subtle darker spots on the body for texture (like the original mascot)
- [ ] **5.5** Ensure consistent tick-based animation loop: single `setInterval` at 100ms driving all animation
- [ ] **5.6** Test all 4 modes look good at their respective agent counts
- [ ] **5.7** Color-check: make sure all 9 agent colors are visually distinct

**Done when:** Scene feels polished, alive, and cozy. Sparkles float, monitors glow, everything bobs happily.

---

## Phase 6 (Future): Pet Integration

> Not in scope for v1. Noted for later.

- [ ] **6.1** Pixel cat/dog that walks across the bottom of the scene
- [ ] **6.2** Pet interacts with figures (jumps on desk, naps near mug)
- [ ] **6.3** Day/night cycle background
- [ ] **6.4** Persistent pet state via `window.storage`

---

## Architecture Notes

**Single file:** Everything lives in one `.jsx` file. No separate CSS, no imports beyond React.

**Animation approach:** One `setInterval(100ms)` increments a `tick` counter. All animation is a pure function of `tick` — no imperative animation, no CSS transitions on the SVG.

**SVG coordinate system:** `viewBox="0 0 700 400"`. Figures are ~40px wide. Desk sits around y=280. HUD at y=0. Task bubbles around y=80-100.

**State:**
- `tick` (number) — animation frame counter
- `modeIdx` (number) — which mode is active
- `agentTasks` (object) — maps agent index → current task string
- `sparkles` (array) — active sparkle particles

**No network calls. No file I/O. Pure visual toy.**
