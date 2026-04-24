import { useState, useEffect, useCallback, useRef } from "react";

// ── Agent Roster ──────────────────────────────────────────────
const AGENTS = [
  { name: "Autopilot",     color: "#C47050", accent: "#A85A3C", light: "#D88868" },
  { name: "Architect",     color: "#4A7FBF", accent: "#3A6399", light: "#6AA0DD" },
  { name: "Critic",        color: "#CF5050", accent: "#A33E3E", light: "#E07070" },
  { name: "Librarian",     color: "#5BA55B", accent: "#468946", light: "#7BC47B" },
  { name: "Explorer",      color: "#3BBFBF", accent: "#2E9999", light: "#66D9D9" },
  { name: "Oracle",        color: "#D4A843", accent: "#B8902E", light: "#E8C060" },
  { name: "Risk Assessor", color: "#9B6BBF", accent: "#7D54A0", light: "#B88BD9" },
  { name: "Worker",        color: "#8BC34A", accent: "#6FA030", light: "#A8DD66" },
  { name: "Validator",     color: "#00BCD4", accent: "#0097A7", light: "#40D8E8" },
];

const MODES = [
  { label: "/autopilot", count: 1 },
  { label: "/deepwork",  count: 3 },
  { label: "/ultrawork", count: 5 },
  { label: "/team",      count: 9 },
];

// Role-specific task templates — {f} is replaced with a real filename when available
const AGENT_ROLE_TASKS = {
  Autopilot:       ["orchestrating pipeline...", "routing {f}...", "delegating tasks...", "coordinating agents...", "sequencing plan..."],
  Architect:       ["designing {f}...", "reviewing structure...", "planning modules...", "diagramming deps...", "evaluating tradeoffs..."],
  Critic:          ["reviewing {f}...", "flagging issues...", "checking quality...", "auditing PR...", "rating complexity..."],
  Librarian:       ["indexing {f}...", "fetching docs...", "searching refs...", "cataloging APIs...", "resolving imports..."],
  Explorer:        ["scanning {f}...", "mapping codebase...", "tracing calls...", "finding usages...", "grepping symbols..."],
  Oracle:          ["analyzing {f}...", "predicting impact...", "profiling perf...", "forecasting risk...", "evaluating deps..."],
  "Risk Assessor": ["assessing {f}...", "checking vulns...", "auditing perms...", "scanning secrets...", "rating severity..."],
  Worker:          ["editing {f}...", "implementing fix...", "writing code...", "refactoring fn...", "building feature..."],
  Validator:       ["testing {f}...", "verifying output...", "running checks...", "validating types...", "confirming fix..."],
};

function getRoleTask(agentName, index, tick, projectTasks) {
  // If the extension sent real task strings, assign them to agents in order
  // (extension.js already orders them by recency/relevance). Slowly rotate
  // when there are more tasks than agents so everyone gets a turn.
  if (projectTasks && projectTasks.length > 0) {
    const offset = Math.floor(tick / 80);
    return projectTasks[(index + offset) % projectTasks.length];
  }
  // Fallback: role-specific templates
  const pool = AGENT_ROLE_TASKS[agentName] || AGENT_ROLE_TASKS.Worker;
  const template = pool[(Math.floor(tick / 50) + index) % pool.length];
  return template.replace(" {f}", "");
}

// ── Sparkle ───────────────────────────────────────────────────
function Sparkle({ x, y, age, color }) {
  const opacity = Math.max(0, 1 - age / 22);
  const dy = -age * 1.4;
  const dx = Math.sin(age * 0.45) * 4;
  const s = 1.5 + Math.sin(age * 0.7) * 0.8;
  return (
    <g opacity={opacity}>
      <rect
        x={x + dx - s / 2} y={y + dy - s / 2}
        width={s} height={s}
        fill={color}
        transform={`rotate(45 ${x + dx} ${y + dy})`}
      />
    </g>
  );
}

// (compact mode — no stars)

// ── Office Background ─────────────────────────────────────────
function OfficeBackground() {
  // Transparent — no background rects. Mascots float over your workspace.
  return null;
}

// ── Desk Row (front-facing shared desk) ──────────────────────
// Renders the desk surface and monitor backs BEHIND the mascots.
// rowY = vertical center of the row (where mascots stand).
// stations = array of {x, color} for each workstation center.
function DeskRow({ stations, deskY, tick }) {
  if (!stations.length) return null;
  const leftX  = stations[0].cx - 28;
  const rightX = stations[stations.length - 1].cx + 28;
  const deskW  = rightX - leftX;

  return (
    <g>
      {/* ── Desk tabletop (back edge) ── */}
      <rect x={leftX - 2} y={deskY - 2} width={deskW + 4} height={2} fill="#6a4030" opacity={0.6} />
      {/* Desk surface */}
      <rect x={leftX} y={deskY} width={deskW} height={10} fill="#4a3020" />
      {/* Surface highlight */}
      <rect x={leftX} y={deskY} width={deskW} height={2}  fill="#5c3c28" />
      {/* Desk front face */}
      <rect x={leftX} y={deskY + 10} width={deskW} height={14} fill="#3a2418" />
      {/* Desk front highlight */}
      <rect x={leftX} y={deskY + 10} width={deskW} height={1} fill="#4a2e1e" />
      {/* Desk legs */}
      {[leftX + 4, rightX - 8].map((lx, li) => (
        <g key={`leg${li}`}>
          <rect x={lx} y={deskY + 24} width={4} height={28} fill="#2a1a10" />
          {/* Foot */}
          <rect x={lx - 2} y={deskY + 50} width={8} height={2} fill="#1e1410" />
        </g>
      ))}

      {/* ── Per-station items on desk ── */}
      {stations.map((st, si) => {
        // Monitor back (we see back of monitor since screen faces the mascot)
        const mx = st.cx - 12;
        const my = deskY - 22;
        // Screen glow (top edge of monitor — slight color bleed from screen)
        const glowOpacity = 0.12 + Math.sin(tick * 0.09 + si * 1.3) * 0.05;
        return (
          <g key={`station${si}`}>
            {/* Monitor frame (screen faces us) */}
            <rect x={mx}     y={my}      width={24} height={18} fill="#1e1e38" rx={1} />
            {/* Screen */}
            <rect x={mx + 2} y={my + 2}  width={20} height={13} fill="#0a0a16" />
            {/* Scrolling code lines on screen */}
            {[0, 1, 2, 3].map((li) => (
              <rect key={`l${li}`}
                x={mx + 4 + ((tick * 0.3 + li * 4) % 5)}
                y={my + 4 + li * 3}
                width={4 + ((li * 11 + tick) % 10)}
                height={1.5}
                fill={st.color}
                opacity={0.3 + Math.sin(tick * 0.1 + li + si) * 0.15} />
            ))}
            {/* Cursor blink */}
            {tick % 10 < 5 && (
              <rect x={mx + 4} y={my + 4 + ((tick >> 2) % 4) * 3}
                width={1.5} height={1.5} fill="#fff" opacity={0.5} />
            )}
            {/* Screen glow */}
            <rect x={mx + 2} y={my + 2} width={20} height={13}
              fill={st.color} opacity={glowOpacity * 0.5} />
            {/* Power LED */}
            <rect x={mx + 11} y={my + 16} width={2} height={1} fill="#5BA55B" opacity={0.5} />
            {/* Monitor stand */}
            <rect x={mx + 9} y={my + 18} width={6}  height={4}  fill="#222240" />
            <rect x={mx + 5} y={my + 22} width={14} height={2}  fill="#282848" />
            {/* Keyboard on desk */}
            <rect x={mx + 1} y={deskY + 3} width={22} height={5} fill="#141428" rx={1} />
            <rect x={mx + 2} y={deskY + 4} width={20} height={3} fill="#1c1c38" rx={1} />
            {/* Key dots */}
            {[0,1,2,3,4].map(ki => (
              <rect key={ki} x={mx + 3 + ki * 3.8} y={deskY + 5}
                width={2.5} height={1.5} fill="#242444" opacity={0.8} />
            ))}
            {/* Small item: mug every other station, rubber duck on alternates */}
            {si % 3 === 0 && (
              <g>
                {/* Coffee mug */}
                <rect x={mx + 26} y={deskY + 1} width={8}  height={8}  fill="#d8d0c4" />
                <rect x={mx + 27} y={deskY + 2} width={6}  height={6}  fill="#4a2e10" />
                <rect x={mx + 34} y={deskY + 3} width={3}  height={2}  fill="#d8d0c4" />
                <rect x={mx + 35} y={deskY + 3} width={2}  height={4}  fill="#d8d0c4" />
                <rect x={mx + 34} y={deskY + 5} width={3}  height={2}  fill="#d8d0c4" />
                {/* Steam */}
                <rect x={mx + 28} y={deskY - 2} width={1.5} height={2}
                  fill="#9999bb"
                  opacity={0.12 + Math.sin(tick * 0.09 + si) * 0.06} />
                <rect x={mx + 31} y={deskY - 3} width={1.5} height={3}
                  fill="#9999bb"
                  opacity={0.12 + Math.sin(tick * 0.09 + si + 1) * 0.06} />
              </g>
            )}
            {si % 3 === 1 && (
              <g>
                {/* Rubber duck */}
                <rect x={mx + 26} y={deskY + 3} width={8}  height={6}  fill="#D4A843" />
                <rect x={mx + 30} y={deskY}     width={5}  height={5}  fill="#D4A843" />
                <rect x={mx + 33} y={deskY + 2} width={4}  height={2}  fill="#CF5050" opacity={0.7} />
                <rect x={mx + 27} y={deskY + 2} width={2}  height={2}  fill="#1a1a2a" />
              </g>
            )}
            {si % 3 === 2 && (
              <g>
                {/* Notepad */}
                <rect x={mx + 26} y={deskY + 1} width={10} height={7}  fill="#e8e0d0" />
                <rect x={mx + 27} y={deskY + 2} width={8}  height={1}  fill="#b0a898" opacity={0.5} />
                <rect x={mx + 27} y={deskY + 4} width={8}  height={1}  fill="#b0a898" opacity={0.4} />
                <rect x={mx + 27} y={deskY + 6} width={5}  height={1}  fill="#b0a898" opacity={0.3} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ── Chair (front-facing, we see the seat) ─────────────────────
function Chair({ cx, y, color }) {
  // cx = horizontal center of chair
  return (
    <g>
      {/* Chair back */}
      <rect x={cx - 28} y={y - 28} width={56} height={36} fill="#1c1c38" rx={3} />
      <rect x={cx - 27} y={y - 27} width={54} height={34} fill="#181832" rx={3} />
      {/* Color accent strip on chair back */}
      <rect x={cx - 27} y={y - 27} width={54} height={5}  fill={color} opacity={0.1} rx={1} />
      {/* Seat */}
      <rect x={cx - 32} y={y + 7}  width={64} height={11} fill="#1c1c38" rx={2} />
      <rect x={cx - 31} y={y + 8}  width={62} height={9}  fill="#181832" rx={2} />
      {/* Central post */}
      <rect x={cx - 4}  y={y + 17} width={8}  height={16} fill="#222240" />
      {/* Wheeled base */}
      <rect x={cx - 28} y={y + 33} width={56} height={5}  fill="#1e1e3a" rx={1} />
      <rect x={cx - 5}  y={y + 30} width={10} height={12} fill="#1e1e3a" rx={1} />
      {/* Wheels */}
      <rect x={cx - 30} y={y + 37} width={7}  height={5}  fill="#151525" rx={1} />
      <rect x={cx + 23} y={y + 37} width={7}  height={5}  fill="#151525" rx={1} />
      <rect x={cx - 4}  y={y + 41} width={8}  height={4}  fill="#151525" rx={1} />
    </g>
  );
}

// ── Task Bubble ───────────────────────────────────────────────
function TaskBubble({ cx, y, text, color, tick }) {
  const maxChars = 20;
  const display  = text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
  const bubbleW  = Math.min(Math.max(display.length * 6.5 + 18, 64), 120);
  const bubbleH  = 22;
  const bx       = cx - bubbleW / 2;

  const dot1 = 0.45 + Math.sin(tick * 0.13)        * 0.3;
  const dot2 = 0.45 + Math.sin(tick * 0.13 + 1.1)  * 0.3;

  return (
    <g>
      {/* Shadow */}
      <rect x={bx + 1} y={y + 1} width={bubbleW} height={bubbleH}
        fill="#000" opacity={0.1} rx={6} />
      {/* Bubble body */}
      <rect x={bx} y={y} width={bubbleW} height={bubbleH}
        fill="#12121e" rx={6} stroke={color} strokeWidth={0.5} opacity={0.94} />
      {/* Text */}
      <text x={cx} y={y + 15} textAnchor="middle"
        fill={color} fontSize="9" fontFamily="monospace" opacity={0.9}>
        {display}
      </text>
      {/* Thought dots */}
      <rect x={cx - 1}  y={y + bubbleH + 2} width={3} height={3}
        fill="#12121e" stroke={color} strokeWidth={0.4}
        rx={1.5} opacity={dot1} />
      <rect x={cx - 4}  y={y + bubbleH + 5} width={2} height={2}
        fill="#12121e" stroke={color} strokeWidth={0.3}
        rx={1} opacity={dot2} />
    </g>
  );
}

// ── Clawd Mascot (front-facing, s=0.35) ──────────────────────
// SHAPE IS LOCKED. Only scale changed to 0.35.
function Clawd({ cx, targetY, agent, tick, index, entryTick }) {
  const age = tick - entryTick;

  const walkDuration = 35;
  const sitDuration  = 8;

  const isWalking = age < walkDuration;
  const isSitting = age >= walkDuration && age < walkDuration + sitDuration;
  const isSeated  = age >= walkDuration + sitDuration;

  // Walk: ease-out from right side
  const walkProgress = Math.min(age / walkDuration, 1);
  const eased  = 1 - Math.pow(1 - walkProgress, 2.5);
  const startX = 730;
  const currentCX = isWalking ? startX + (cx - startX) * eased : cx;

  // Walk bounce
  const walkBounce = isWalking ? Math.abs(Math.sin(age * 0.55)) * -3 : 0;

  // Sit-down settle
  let sitOffset = 0;
  if (isSitting) {
    const sp = (age - walkDuration) / sitDuration;
    sitOffset = sp < 0.7 ? (sp / 0.7) * 4 : 4 - ((sp - 0.7) / 0.3) * 1;
  }

  // Idle bob (very subtle)
  const idleBob = isSeated ? Math.sin(tick * 0.09 + index * 1.2) * 1.0 : 0;

  // Look-around: slight eye shift
  const lookPhase = (tick + index * 23) % 80;
  const eyeShift  = isSeated && lookPhase >= 72 && lookPhase < 77 ? -1 : 0;

  // Blink
  const blinkCycle = (tick + index * 19) % 65;
  const isBlink    = isSeated && blinkCycle >= 57;

  // Walking leg animation
  const walkCycle = isWalking ? Math.sin(age * 0.55) : 0;

  // Sitting leg tuck
  let legTuck = 0;
  if (isSitting) {
    const sp = (age - walkDuration) / sitDuration;
    legTuck = sp < 0.5 ? sp * 3 : (1 - sp) * 3;
  }

  const entryOpacity = Math.min(age / 5, 1);

  // Scale
  const s  = 0.75;
  const bw = 88 * s;   // 30.8
  const bh = 68 * s;   // 23.8
  const ew = 13 * s;   //  4.55
  const eh = 19 * s;   //  6.65
  const lw = 10 * s;   //  3.5
  const lh = Math.max((18 - legTuck) * s, 3);

  // bx = left edge of body, centered on cx
  const bx = currentCX - bw / 2;
  // typingLean applied below after it's computed
  const by0 = targetY + walkBounce + sitOffset + idleBob;

  const col = agent.color;
  const acc = agent.accent;
  const lit = agent.light;

  // Walking leg Y offsets
  const legYL1 = isWalking ? walkCycle * 3   : 0;
  const legYL2 = isWalking ? -walkCycle * 3  : 0;
  const legYR1 = isWalking ? -walkCycle * 3  : 0;
  const legYR2 = isWalking ? walkCycle * 3   : 0;

  // Typing animation: ears wiggle, body leans forward slightly
  const earWiggle = isSeated ? Math.sin(tick * 0.22 + index * 0.9) * 0.5 : 0;
  const typingLean = isSeated ? Math.sin(tick * 0.15 + index * 0.6) * 0.6 : 0;
  const by = by0 + typingLean;

  const totalW = ew + bw + ew;
  const totalH = bh + lh;

  return (
    <g opacity={entryOpacity}>
      {/* Shadow on floor */}
      <ellipse
        cx={currentCX} cy={by + totalH + 1}
        rx={totalW * 0.45} ry={2}
        fill="#000" opacity={0.15}
      />

      {/* BODY */}
      <rect x={bx} y={by} width={bw} height={bh} fill={col} />
      {/* Body highlight top */}
      <rect x={bx} y={by} width={bw} height={2}   fill={lit} opacity={0.18} />
      {/* Body shadow bottom */}
      <rect x={bx} y={by + bh - 2} width={bw} height={2} fill={acc} opacity={0.25} />
      {/* Body pixel detail: side panel lines */}
      <rect x={bx + 2}    y={by + 4} width={1} height={bh - 8} fill={acc} opacity={0.12} />
      <rect x={bx + bw - 3} y={by + 4} width={1} height={bh - 8} fill={acc} opacity={0.12} />

      {/* SIDE EARS */}
      <rect x={bx - ew + earWiggle}    y={by + 16 * s} width={ew} height={eh} fill={col} />
      <rect x={bx + bw - earWiggle}    y={by + 16 * s} width={ew} height={eh} fill={col} />
      {/* Ear inner shadow */}
      <rect x={bx - ew + earWiggle + 1} y={by + 16 * s + 1} width={ew - 2} height={eh - 2} fill={acc} opacity={0.15} />
      <rect x={bx + bw - earWiggle + 1} y={by + 16 * s + 1} width={ew - 2} height={eh - 2} fill={acc} opacity={0.15} />

      {/* EYES */}
      {isBlink ? (
        <>
          {/* > < chevron blink */}
          <rect x={bx + 15 * s} y={by + 13 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
          <rect x={bx + 22 * s} y={by + 20 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
          <rect x={bx + 15 * s} y={by + 27 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
          <rect x={bx + 66 * s} y={by + 13 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
          <rect x={bx + 59 * s} y={by + 20 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
          <rect x={bx + 66 * s} y={by + 27 * s} width={7 * s} height={7 * s} fill="#1a1a1a" />
        </>
      ) : (
        <>
          {/* Vertical slot eyes */}
          <rect x={bx + 18 * s + eyeShift} y={by + 16 * s} width={8 * s} height={24 * s} fill="#1a1a1a" />
          <rect x={bx + 62 * s + eyeShift} y={by + 16 * s} width={8 * s} height={24 * s} fill="#1a1a1a" />
          {/* Eye shine pixels */}
          <rect x={bx + 19 * s + eyeShift} y={by + 17 * s} width={2 * s} height={2 * s} fill="#ffffff" opacity={0.5} />
          <rect x={bx + 63 * s + eyeShift} y={by + 17 * s} width={2 * s} height={2 * s} fill="#ffffff" opacity={0.5} />
        </>
      )}

      {/* LEGS */}
      <rect x={bx + 5  * s} y={by + bh + legYL1} width={lw} height={lh} fill={acc} />
      <rect x={bx + 19 * s} y={by + bh + legYL2} width={lw} height={lh} fill={acc} />
      <rect x={bx + 59 * s} y={by + bh + legYR1} width={lw} height={lh} fill={acc} />
      <rect x={bx + 73 * s} y={by + bh + legYR2} width={lw} height={lh} fill={acc} />

      {/* Name tag (only when seated) */}
      {isSeated && (
        <text
          x={currentCX} y={by + totalH + 18}
          textAnchor="middle"
          fill={col} fontSize="9" fontFamily="monospace" opacity={0.55}
        >
          {agent.name}
        </text>
      )}

      {/* Typing indicator dots (when seated) */}
      {isSeated && (
        <g>
          {[0, 1, 2].map(di => {
            const phase = (tick * 0.18 + di * 0.85) % (Math.PI * 2);
            const op  = Math.max(0, 0.25 + Math.sin(phase) * 0.5);
            const dy2 = Math.sin(phase) * 1.2;
            return (
              <rect
                key={di}
                x={currentCX - 6 + di * 6} y={by + totalH + 26 + dy2}
                width={2} height={2}
                fill={col} opacity={op} rx={1}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

// ── HUD Bar ───────────────────────────────────────────────────
// Layout adapts to `width` (the SVG viewBox width). Left-side segments
// (project name, mode, agents) start from x=14 with separators; right-side
// segments (tokens, Clauding) are right-anchored to `width - 14`.
function HUD({ mode, agentCount, tick, projectName, width }) {
  const dotCount = Math.floor(tick / 3) % 4;
  const dots     = ".".repeat(dotCount);
  const tokenK   = 124 + (Math.floor(tick * 0.28) % 200);
  return (
    <g>
      <rect x={0} y={0}  width={width} height={44} fill="#080810" />
      <rect x={0} y={43} width={width} height={1}  fill="#1a1a30" />

      <text x={14} y={30} fill="#C47050" fontSize="16" fontFamily="monospace" fontWeight="bold">
        {projectName || "oh-my-claudecode"}
      </text>

      <rect x={210} y={10} width={1}  height={24} fill="#1a1a30" />
      <text x={224} y={30} fill="#666" fontSize="14" fontFamily="monospace">{mode}</text>

      <rect x={340} y={10} width={1}  height={24} fill="#1a1a30" />
      <text x={354} y={30} fill="#666" fontSize="14" fontFamily="monospace">agents: {agentCount}</text>

      <text x={width - 14} y={30} textAnchor="end"
        fill="#5BA55B" fontSize="14" fontFamily="monospace">
        Clauding{dots}
      </text>
      <rect x={width - 110} y={10} width={1} height={24} fill="#1a1a30" />
      <text x={width - 120} y={30} textAnchor="end"
        fill="#666" fontSize="14" fontFamily="monospace">{tokenK}k tokens</text>
    </g>
  );
}

// ── Grid layout helpers ────────────────────────────────────────
// Returns { rows, width } where rows is [{deskY, mascotY, stations, agentOffset}]
// and width is the SVG viewBox width sized to hug the content. Minimum width
// is MIN_VB_WIDTH so the HUD stays legible in /autopilot mode.
const MIN_VB_WIDTH = 420;
function getLayout(agents) {
  const SW = 110;
  const SIDE_PAD = 22;
  const ROW1_DESK_Y   = 80;
  const ROW1_MASCOT_Y = 110;
  const ROW2_DESK_Y   = 190;
  const ROW2_MASCOT_Y = 220;

  const count = agents.length;

  const rowFor = (rowAgents) => rowAgents.length * SW + SIDE_PAD * 2;

  if (count <= 5) {
    const rowW   = rowFor(agents);
    const width  = Math.max(rowW, MIN_VB_WIDTH);
    const startX = (width - agents.length * SW) / 2 + SW / 2;
    const stations = agents.map((ag, i) => ({ cx: startX + i * SW, color: ag.color }));
    return {
      width,
      rows: [{ deskY: ROW1_DESK_Y, mascotY: ROW1_MASCOT_Y, stations, agentOffset: 0 }],
    };
  }

  // 6+ agents: split across two rows (top gets ceil, bottom gets rest)
  const topCount = Math.min(5, Math.ceil(count / 2));
  const top      = agents.slice(0, topCount);
  const bottom   = agents.slice(topCount);
  const width    = Math.max(rowFor(top), rowFor(bottom), MIN_VB_WIDTH);
  const topStartX = (width - top.length    * SW) / 2 + SW / 2;
  const botStartX = (width - bottom.length * SW) / 2 + SW / 2;
  return {
    width,
    rows: [
      {
        deskY: ROW1_DESK_Y, mascotY: ROW1_MASCOT_Y,
        stations: top.map((ag, i) => ({ cx: topStartX + i * SW, color: ag.color })),
        agentOffset: 0,
      },
      {
        deskY: ROW2_DESK_Y, mascotY: ROW2_MASCOT_Y,
        stations: bottom.map((ag, i) => ({ cx: botStartX + i * SW, color: ag.color })),
        agentOffset: topCount,
      },
    ],
  };
}

// ── Main Scene ────────────────────────────────────────────────
export default function OMCScene() {
  const [tick,         setTick]         = useState(0);
  const [modeIdx,      setModeIdx]      = useState(0);
  const [agentCount,   setAgentCount]   = useState(null); // null = use mode count
  const [agentTasks,   setAgentTasks]   = useState({});
  const [sparkles,     setSparkles]     = useState([]);
  const [entryTicks,   setEntryTicks]   = useState({ 0: 0 });
  const [projectName,  setProjectName]  = useState("");
  const [projectTasks, setProjectTasks] = useState([]);
  const [scale,        setScale]        = useState(1);    // 0.5 – 1.5 in 0.25 steps
  const [hidden,       setHidden]       = useState(false);

  const mode         = MODES[modeIdx];
  // agentCount from extension overrides mode-based count
  const effectiveCount = agentCount !== null ? agentCount : mode.count;
  const activeAgents = AGENTS.slice(0, Math.min(effectiveCount, AGENTS.length));

  // Refs mirror committed state so the message listener can read fresh
  // values without re-subscribing every render. Needed because the extension
  // can burst `setAgentCount` + `setMode` back-to-back (3s poll + edit
  // watchers): with the old `[modeIdx, tick, effectiveCount]` deps, the
  // second message in a burst read a stale closure and anchored the entry
  // tick range to pre-batch values, dropping walk-in animations.
  const tickRef           = useRef(tick);
  const modeIdxRef        = useRef(modeIdx);
  const effectiveCountRef = useRef(effectiveCount);
  useEffect(() => { tickRef.current           = tick;           }, [tick]);
  useEffect(() => { modeIdxRef.current        = modeIdx;        }, [modeIdx]);
  useEffect(() => { effectiveCountRef.current = effectiveCount; }, [effectiveCount]);

  // VS Code message listener — receives project info and auto-sets agent count.
  // Subscribed once ([] deps); reads refs for state that can change between
  // messages in the same tick.
  useEffect(() => {
    function spawnEntryTicks(prevCount, newCount) {
      if (newCount <= prevCount) return;
      const t = tickRef.current;
      setEntryTicks((prev) => {
        const next = { ...prev };
        for (let i = prevCount; i < newCount; i++) next[i] = t;
        return next;
      });
    }

    function handleMessage(event) {
      const msg = event.data;
      if (msg.type === "projectTasks") {
        setProjectTasks(Array.isArray(msg.tasks) ? msg.tasks : []);
      }
      if (msg.type === "projectName")  setProjectName(msg.name);
      if (msg.type === "setAgentCount" && typeof msg.count === "number") {
        const newCount  = Math.max(1, Math.min(msg.count, AGENTS.length));
        const prevCount = effectiveCountRef.current;
        effectiveCountRef.current = newCount; // keep fresh for next message in burst
        setAgentCount(newCount);
        spawnEntryTicks(prevCount, newCount);
      }
      // Legacy mode support
      if (msg.type === "setMode" && typeof msg.modeIdx === "number") {
        const idx = Math.max(0, Math.min(msg.modeIdx, MODES.length - 1));
        if (idx !== modeIdxRef.current) {
          const prevCount = effectiveCountRef.current;
          const newCount  = MODES[idx].count;
          modeIdxRef.current        = idx;
          effectiveCountRef.current = newCount;
          setModeIdx(idx);
          setAgentCount(null); // revert to mode-based
          spawnEntryTicks(prevCount, newCount);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Tick loop
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  // Rotate task bubbles. Runs (a) immediately when projectTasks changes so
  // real edits appear without a 5s delay, (b) when the active agent count
  // changes, and (c) on a slow ~3s cadence via the tick bucket so fallback
  // templates still cycle when the extension isn't sending data.
  const tickBucket = Math.floor(tick / 30);
  useEffect(() => {
    const next = {};
    activeAgents.forEach((agent, i) => {
      next[i] = getRoleTask(agent.name, i, tick, projectTasks);
    });
    setAgentTasks(next);
    // `tick` is intentionally omitted: `tickBucket` drives the 3s cadence,
    // and depending on `tick` directly would fire this effect every 100ms.
    // `activeAgents` (the array ref) is also excluded; only its .length
    // matters for this effect, and agent ordering is fixed (sliced from the
    // same AGENTS roster in index order), so a ref change without a length
    // change cannot happen today.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickBucket, activeAgents.length, projectTasks]);

  // Sparkles
  useEffect(() => {
    if (tick % 8 === 0 && activeAgents.length > 0) {
      const ai  = Math.floor(Math.random() * activeAgents.length);
      const { rows } = getLayout(activeAgents);
      let rowIdx = 0, stationIdx = ai;
      if (rows.length > 1 && ai >= 5) { rowIdx = 1; stationIdx = ai - 5; }
      const row = rows[rowIdx];
      if (!row || !row.stations[stationIdx]) return;
      const st = row.stations[stationIdx];
      const sx = st.cx + (Math.random() - 0.5) * 16;
      const sy = row.mascotY - 8;
      setSparkles(prev => [
        ...prev.filter(s => tick - s.born < 22).slice(-20),
        { x: sx, y: sy, born: tick, color: activeAgents[ai].color },
      ]);
    }
  }, [tick, activeAgents.length]);

  const switchMode = useCallback((idx) => {
    const prevCount = effectiveCount;
    const newCount  = MODES[idx].count;
    setModeIdx(idx);
    setAgentCount(null); // revert to mode-based
    if (newCount > prevCount) {
      setEntryTicks(prev => {
        const next = { ...prev };
        for (let i = prevCount; i < newCount; i++) next[i] = tick;
        return next;
      });
    }
  }, [effectiveCount, tick]);

  const { rows, width: vbWidth } = getLayout(activeAgents);
  // Shrink the SVG to the actual content so the host window / panel doesn't
  // stretch a giant transparent box over the user's clickable UI.
  const vbHeight = rows.length === 1 ? 180 : 290;

  // Shared chrome-button styling — small, pixel-terminal aesthetic.
  const btnStyle = {
    pointerEvents: "auto",
    width: 22,
    height: 22,
    padding: 0,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: "20px",
    color: "#C47050",
    background: "#12121e",
    border: "1px solid #2a2a44",
    borderRadius: 4,
    cursor: "pointer",
  };

  if (hidden) {
    return (
      <div style={{
        background: "transparent",
        pointerEvents: "none",
        display: "flex",
        justifyContent: "flex-end",
        padding: 4,
      }}>
        <button
          onClick={() => setHidden(false)}
          title="Show pets"
          style={{ ...btnStyle, width: "auto", padding: "0 8px" }}
        >
          ▲ pets
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "transparent",
      overflow: "hidden",
      fontFamily: "monospace",
      pointerEvents: "none",
      width: "100%",
      lineHeight: 0,
    }}>
      {/* Control strip above the scene: size − / + / hide. Lives in its
          own row so it can't overlap HUD text, and only the buttons opt
          back into pointer events — the rest of the strip is click-through. */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 3,
        padding: "3px 4px",
        pointerEvents: "none",
      }}>
        <button
          onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
          disabled={scale <= 0.5}
          title={`Smaller (${scale.toFixed(2)}x)`}
          style={btnStyle}
        >−</button>
        <button
          onClick={() => setScale((s) => Math.min(1.5, +(s + 0.25).toFixed(2)))}
          disabled={scale >= 1.5}
          title={`Larger (${scale.toFixed(2)}x)`}
          style={btnStyle}
        >+</button>
        <button
          onClick={() => setHidden(true)}
          title="Hide"
          style={btnStyle}
        >×</button>
      </div>

      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          margin: "0 auto",
          width: `${Math.round(scale * vbWidth)}px`,
          maxWidth: "100%",
          pointerEvents: "none",
        }}
      >

        {/* No background — transparent overlay */}

        <HUD
          mode={mode.label}
          agentCount={activeAgents.length}
          tick={tick}
          projectName={projectName}
          width={vbWidth}
        />

        {/* Render each desk row */}
        {rows.map((row, ri) => (
          <g key={`row${ri}`}>
            {/* 1. Chairs (furthest back) */}
            {row.stations.map((st, si) => {
              const agentIdx = row.agentOffset + si;
              const age = tick - (entryTicks[agentIdx] || 0);
              const isVisible = age >= 35 + 8 - 4;
              if (!isVisible) return null;
              return (
                <Chair key={`chair${agentIdx}`}
                  cx={st.cx} y={row.mascotY + 22} color={st.color} />
              );
            })}

            {/* 2. Mascots (behind desk — rendered before desk) */}
            {row.stations.map((st, si) => {
              const agentIdx = row.agentOffset + si;
              const agent = activeAgents[agentIdx];
              if (!agent) return null;
              return (
                <Clawd key={`agent${agentIdx}`}
                  cx={st.cx} targetY={row.mascotY}
                  agent={agent} tick={tick} index={agentIdx}
                  entryTick={entryTicks[agentIdx] || 0} />
              );
            })}

            {/* 3. Desk + front-facing monitors (IN FRONT of mascots) */}
            <DeskRow stations={row.stations} deskY={row.deskY} tick={tick} />

            {/* 4. Task bubbles (ON TOP of everything) */}
            {row.stations.map((st, si) => {
              const agentIdx = row.agentOffset + si;
              const agent = activeAgents[agentIdx];
              if (!agent) return null;
              const isSeated = (tick - (entryTicks[agentIdx] || 0)) >= 43;
              if (!isSeated) return null;
              return (
                <TaskBubble key={`bubble${agentIdx}`}
                  cx={st.cx} y={row.mascotY - 52}
                  text={agentTasks[agentIdx] || "initializing..."}
                  color={agent.color} tick={tick} />
              );
            })}
          </g>
        ))}

        {/* Sparkles */}
        {sparkles.filter(s => tick - s.born < 22).map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} age={tick - s.born} color={s.color} />
        ))}

      </svg>

      {/* Mode buttons hidden in overlay mode */}
      <div style={{ display: "none" }}>
        {MODES.map((m, idx) => (
          <button key={m.label} onClick={() => switchMode(idx)}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
