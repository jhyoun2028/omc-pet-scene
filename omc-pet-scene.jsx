import { useState, useEffect, useCallback } from "react";

// ── Agent Roster ──────────────────────────────────────────────
const AGENTS = [
  { name: "Autopilot", color: "#E07045", accent: "#C45A32" },
  { name: "Architect", color: "#4A7FBF", accent: "#3A6399" },
  { name: "Critic", color: "#CF5050", accent: "#A33E3E" },
  { name: "Librarian", color: "#5BA55B", accent: "#468946" },
  { name: "Explorer", color: "#3BBFBF", accent: "#2E9999" },
  { name: "Oracle", color: "#D4A843", accent: "#B8902E" },
  { name: "Risk Assessor", color: "#9B6BBF", accent: "#7D54A0" },
  { name: "Worker", color: "#8BC34A", accent: "#6FA030" },
  { name: "Validator", color: "#00BCD4", accent: "#0097A7" },
];

const MODES = [
  { label: "/autopilot", count: 1 },
  { label: "/deepwork", count: 3 },
  { label: "/ultrawork", count: 5 },
  { label: "/team", count: 9 },
];

const TASKS_POOL = [
  "refactoring auth...",
  "reviewing PR #42...",
  "fixing flaky test...",
  "optimizing query...",
  "writing docs...",
  "analyzing deps...",
  "tracing bug...",
  "checking types...",
  "running lint...",
  "deploying v2.1...",
  "scanning vulns...",
  "profiling render...",
  "migrating schema...",
  "updating CI...",
  "reading logs...",
  "planning sprint...",
  "auditing perms...",
  "benchmarking...",
];

// ── Sparkle ───────────────────────────────────────────────────
function Sparkle({ x, y, age, color }) {
  const opacity = Math.max(0, 1 - age / 30);
  const dy = -age * 1.2;
  const size = 3 + Math.sin(age * 0.5) * 1.5;
  return (
    <rect
      x={x - size / 2}
      y={y + dy - size / 2}
      width={size}
      height={size}
      fill={color}
      opacity={opacity}
      transform={`rotate(45 ${x} ${y + dy})`}
    />
  );
}

// ── Monitor ───────────────────────────────────────────────────
function Monitor({ x, y, color, tick }) {
  const lines = [0, 1, 2, 3, 4];
  return (
    <g>
      {/* Screen frame */}
      <rect x={x} y={y} width={28} height={20} fill="#1a1a2e" rx={1} />
      <rect x={x + 1} y={y + 1} width={26} height={18} fill="#0d0d1a" rx={1} />
      {/* Stand */}
      <rect x={x + 11} y={y + 20} width={6} height={4} fill="#2a2a3e" />
      <rect x={x + 8} y={y + 24} width={12} height={2} fill="#2a2a3e" />
      {/* Scrolling code lines */}
      {lines.map((i) => {
        const lineY = y + 3 + i * 3.5;
        const offset = ((tick * 0.5 + i * 7) % 20);
        const w = 6 + ((i * 13 + tick) % 12);
        return (
          <rect
            key={i}
            x={x + 3 + offset * 0.3}
            y={lineY}
            width={Math.min(w, 22)}
            height={1.5}
            fill={color}
            opacity={0.4 + Math.sin(tick * 0.1 + i) * 0.2}
            rx={0.5}
          />
        );
      })}
      {/* Screen glow */}
      <rect
        x={x + 1}
        y={y + 1}
        width={26}
        height={18}
        fill={color}
        opacity={tick % 60 < 2 ? 0.15 : 0.03}
        rx={1}
      />
    </g>
  );
}

// ── Coffee Mug ────────────────────────────────────────────────
function CoffeeMug({ x, y, tick }) {
  return (
    <g>
      {/* Mug body */}
      <rect x={x} y={y} width={12} height={14} fill="#e8e0d4" rx={1} />
      {/* Coffee fill */}
      <rect x={x + 1} y={y + 3} width={10} height={10} fill="#5c3a1e" rx={1} />
      {/* Handle */}
      <rect x={x + 12} y={y + 3} width={4} height={3} fill="#e8e0d4" />
      <rect x={x + 14} y={y + 3} width={2} height={8} fill="#e8e0d4" />
      <rect x={x + 12} y={y + 9} width={4} height={3} fill="#e8e0d4" />
      {/* Steam */}
      {[0, 1, 2].map((i) => {
        const sy = y - 4 - Math.sin(tick * 0.12 + i * 2) * 3;
        const sx = x + 3 + i * 3;
        return (
          <rect
            key={i}
            x={sx}
            y={sy}
            width={2}
            height={2}
            fill="#8888aa"
            opacity={0.3 + Math.sin(tick * 0.08 + i) * 0.15}
          />
        );
      })}
    </g>
  );
}

// ── Rubber Duck ───────────────────────────────────────────────
function RubberDuck({ x, y, tick }) {
  const bob = Math.sin(tick * 0.08) * 0.8;
  return (
    <g transform={`translate(0, ${bob})`}>
      {/* Body */}
      <rect x={x} y={y + 4} width={12} height={10} fill="#FFD93D" rx={2} />
      {/* Head */}
      <rect x={x + 2} y={y} width={10} height={8} fill="#FFD93D" rx={2} />
      {/* Beak */}
      <rect x={x + 11} y={y + 3} width={5} height={3} fill="#FF8C00" rx={1} />
      {/* Eye */}
      <rect x={x + 8} y={y + 2} width={2} height={2} fill="#1a1a2e" />
      {/* Wing */}
      <rect x={x + 1} y={y + 6} width={4} height={5} fill="#F0C830" rx={1} />
    </g>
  );
}

// ── Desk ──────────────────────────────────────────────────────
function Desk({ x, y, width }) {
  return (
    <g>
      {/* Desk surface */}
      <rect x={x} y={y} width={width} height={8} fill="#5c4033" rx={2} />
      <rect x={x + 2} y={y + 1} width={width - 4} height={3} fill="#6d4c3a" rx={1} />
      {/* Legs */}
      <rect x={x + 8} y={y + 8} width={6} height={20} fill="#4a3328" rx={1} />
      <rect x={x + width - 14} y={y + 8} width={6} height={20} fill="#4a3328" rx={1} />
      {/* Shelf bar under desk */}
      <rect x={x + 6} y={y + 22} width={width - 12} height={3} fill="#4a3328" rx={1} />
    </g>
  );
}

// ── Task Bubble ───────────────────────────────────────────────
function TaskBubble({ x, y, text, color }) {
  const maxChars = 20;
  const display = text.length > maxChars ? text.slice(0, maxChars - 2) + ".." : text;
  const bubbleW = Math.max(display.length * 5.5 + 12, 50);
  const bx = x - bubbleW / 2;
  return (
    <g>
      {/* Bubble background */}
      <rect x={bx} y={y} width={bubbleW} height={18} fill="#1a1a2e" rx={4} stroke={color} strokeWidth={1} opacity={0.92} />
      {/* Pointer triangle */}
      <polygon points={`${x - 4},${y + 18} ${x + 4},${y + 18} ${x},${y + 23}`} fill="#1a1a2e" stroke={color} strokeWidth={1} />
      {/* Cover the stroke where pointer meets bubble */}
      <rect x={x - 5} y={y + 16} width={10} height={3} fill="#1a1a2e" />
      {/* Text */}
      <text x={x} y={y + 12.5} textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" opacity={0.9}>
        {display}
      </text>
    </g>
  );
}

// ── Claude Figure ─────────────────────────────────────────────
function ClaudeFigure({ x, y, agent, tick, index, entryTick }) {
  // Entry animation
  const age = tick - entryTick;
  const entryOffset = age < 15 ? (15 - age) * 4 : 0;
  const entryOpacity = age < 15 ? age / 15 : 1;

  // Idle bob
  const bob = Math.sin(tick * 0.15 + index * 1.2) * 1.5;

  // Blink: eyes squish every ~40 ticks (each agent offset)
  const blinkCycle = (tick + index * 13) % 45;
  const isBlinking = blinkCycle < 2;

  // Antenna wiggle
  const antennaL = Math.sin(tick * 0.2 + index * 0.8) * 2;
  const antennaR = Math.sin(tick * 0.2 + index * 0.8 + 1.5) * 2;

  // Typing arms
  const armPhase = Math.sin(tick * 0.3 + index * 0.5);
  const leftArmX = armPhase > 0 ? -2 : 0;
  const rightArmX = armPhase > 0 ? 0 : 2;

  const figX = x + entryOffset;
  const figY = y + bob;

  return (
    <g opacity={entryOpacity}>
      {/* Shadow */}
      <ellipse cx={figX + 18} cy={y + 56} rx={16} ry={3} fill="#000" opacity={0.2} />

      {/* Legs */}
      <rect x={figX + 6} y={figY + 44} width={7} height={10} fill={agent.accent} rx={1} />
      <rect x={figX + 23} y={figY + 44} width={7} height={10} fill={agent.accent} rx={1} />

      {/* Body */}
      <rect x={figX + 2} y={figY + 24} width={32} height={22} fill={agent.color} rx={2} />
      {/* Body texture pixels */}
      <rect x={figX + 6} y={figY + 28} width={3} height={3} fill={agent.accent} opacity={0.4} />
      <rect x={figX + 26} y={figY + 36} width={3} height={3} fill={agent.accent} opacity={0.4} />
      <rect x={figX + 14} y={figY + 32} width={3} height={3} fill={agent.accent} opacity={0.3} />

      {/* Arms */}
      <rect x={figX - 4 + leftArmX} y={figY + 28} width={6} height={12} fill={agent.color} rx={1} />
      <rect x={figX + 34 + rightArmX} y={figY + 28} width={6} height={12} fill={agent.color} rx={1} />

      {/* Head */}
      <rect x={figX} y={figY + 4} width={36} height={22} fill={agent.color} rx={2} />

      {/* Antenna left */}
      <rect x={figX + 6 + antennaL} y={figY - 8} width={3} height={14} fill={agent.accent} rx={1} />
      <circle cx={figX + 7.5 + antennaL} cy={figY - 9} r={3} fill={agent.accent} />

      {/* Antenna right */}
      <rect x={figX + 27 + antennaR} y={figY - 8} width={3} height={14} fill={agent.accent} rx={1} />
      <circle cx={figX + 28.5 + antennaR} cy={figY - 9} r={3} fill={agent.accent} />

      {/* Eyes */}
      {isBlinking ? (
        <>
          <rect x={figX + 8} y={figY + 13} width={8} height={2} fill="#1a1a2e" rx={0.5} />
          <rect x={figX + 21} y={figY + 13} width={8} height={2} fill="#1a1a2e" rx={0.5} />
        </>
      ) : (
        <>
          <rect x={figX + 8} y={figY + 10} width={8} height={8} fill="#1a1a2e" rx={1} />
          <rect x={figX + 21} y={figY + 10} width={8} height={8} fill="#1a1a2e" rx={1} />
          {/* Shine */}
          <rect x={figX + 12} y={figY + 11} width={3} height={3} fill="#fff" opacity={0.9} />
          <rect x={figX + 25} y={figY + 11} width={3} height={3} fill="#fff" opacity={0.9} />
        </>
      )}

      {/* Name tag */}
      <text
        x={figX + 18}
        y={y + 66}
        textAnchor="middle"
        fill={agent.color}
        fontSize="6"
        fontFamily="monospace"
        opacity={0.7}
      >
        {agent.name}
      </text>
    </g>
  );
}

// ── HUD Bar ───────────────────────────────────────────────────
function HUD({ mode, agentCount, tick }) {
  const dots = ".".repeat((tick % 12) < 3 ? 1 : (tick % 12) < 6 ? 2 : (tick % 12) < 9 ? 3 : 0);
  const tokenK = 124 + Math.floor(tick * 0.3) % 200;
  return (
    <g>
      <rect x={0} y={0} width={700} height={28} fill="#12121e" />
      <rect x={0} y={27} width={700} height={1} fill="#2a2a3e" />
      {/* Left: title */}
      <text x={12} y={18} fill="#E07045" fontSize="10" fontFamily="monospace" fontWeight="bold">
        oh-my-claudecode
      </text>
      {/* Mode */}
      <text x={180} y={18} fill="#8888aa" fontSize="9" fontFamily="monospace">
        {mode}
      </text>
      {/* Agent count */}
      <text x={300} y={18} fill="#8888aa" fontSize="9" fontFamily="monospace">
        agents: {agentCount}
      </text>
      {/* Tokens */}
      <text x={420} y={18} fill="#8888aa" fontSize="9" fontFamily="monospace">
        {tokenK}k tokens
      </text>
      {/* Clauding indicator */}
      <text x={560} y={18} fill="#5BA55B" fontSize="9" fontFamily="monospace">
        Clauding{dots}
      </text>
      {/* Model */}
      <text x={650} y={18} fill="#666680" fontSize="8" fontFamily="monospace">
        Opus (1M)
      </text>
    </g>
  );
}

// ── Main Scene ────────────────────────────────────────────────
export default function OMCScene() {
  const [tick, setTick] = useState(0);
  const [modeIdx, setModeIdx] = useState(0);
  const [agentTasks, setAgentTasks] = useState({});
  const [sparkles, setSparkles] = useState([]);
  const [entryTicks, setEntryTicks] = useState({ 0: 0 });

  const mode = MODES[modeIdx];
  const activeAgents = AGENTS.slice(0, mode.count);

  // Animation loop
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  // Rotate tasks every ~50 ticks per agent
  useEffect(() => {
    if (tick % 50 === 0) {
      const newTasks = {};
      activeAgents.forEach((_, i) => {
        newTasks[i] = TASKS_POOL[Math.floor(Math.random() * TASKS_POOL.length)];
      });
      setAgentTasks(newTasks);
    }
  }, [tick, activeAgents.length]);

  // Spawn sparkles
  useEffect(() => {
    if (tick % 8 === 0 && activeAgents.length > 0) {
      const agentIdx = Math.floor(Math.random() * activeAgents.length);
      const spacing = Math.min(70, 500 / Math.max(activeAgents.length, 1));
      const startX = 350 - (activeAgents.length * spacing) / 2;
      const sx = startX + agentIdx * spacing + 18 + (Math.random() - 0.5) * 20;
      setSparkles((prev) => [
        ...prev.filter((s) => tick - s.born < 30).slice(-20),
        { x: sx, y: 180, born: tick, color: activeAgents[agentIdx].color },
      ]);
    }
  }, [tick, activeAgents.length]);

  // Mode switch handler
  const switchMode = useCallback(
    (idx) => {
      const prevCount = MODES[modeIdx].count;
      const newCount = MODES[idx].count;
      setModeIdx(idx);
      // Record entry ticks for new agents
      if (newCount > prevCount) {
        setEntryTicks((prev) => {
          const next = { ...prev };
          for (let i = prevCount; i < newCount; i++) {
            next[i] = tick;
          }
          return next;
        });
      }
    },
    [modeIdx, tick]
  );

  // Layout
  const spacing = Math.min(70, 500 / Math.max(activeAgents.length, 1));
  const totalWidth = activeAgents.length * spacing + 40;
  const startX = 350 - totalWidth / 2 + 20;
  const deskX = startX - 20;
  const deskY = 280;
  const figureBaseY = 220;

  return (
    <div
      style={{
        background: "#0a0a1a",
        borderRadius: 8,
        padding: 0,
        overflow: "hidden",
        maxWidth: 750,
        margin: "0 auto",
        fontFamily: "monospace",
      }}
    >
      <svg viewBox="0 0 700 400" width="100%" style={{ display: "block" }}>
        {/* Background */}
        <rect x={0} y={0} width={700} height={400} fill="#0a0a1a" />

        {/* Subtle grid lines */}
        {[100, 200, 300, 400, 500, 600].map((gx) => (
          <line key={gx} x1={gx} y1={30} x2={gx} y2={400} stroke="#141428" strokeWidth={1} />
        ))}
        {[80, 160, 240, 320].map((gy) => (
          <line key={gy} x1={0} y1={gy} x2={700} y2={gy} stroke="#141428" strokeWidth={1} />
        ))}

        {/* HUD */}
        <HUD mode={mode.label} agentCount={activeAgents.length} tick={tick} />

        {/* Desk */}
        <Desk x={deskX} y={deskY} width={totalWidth} />

        {/* Monitors on desk */}
        {activeAgents.map((agent, i) => (
          <Monitor
            key={`mon-${i}`}
            x={startX + i * spacing + 4}
            y={deskY - 26}
            color={agent.color}
            tick={tick}
          />
        ))}

        {/* Coffee mug */}
        <CoffeeMug x={deskX + totalWidth - 20} y={deskY - 16} tick={tick} />

        {/* Rubber duck */}
        <RubberDuck x={deskX + 6} y={deskY - 16} tick={tick} />

        {/* Task bubbles */}
        {activeAgents.map((agent, i) => (
          <TaskBubble
            key={`bubble-${i}`}
            x={startX + i * spacing + 18}
            y={figureBaseY - 35}
            text={agentTasks[i] || "initializing..."}
            color={agent.color}
          />
        ))}

        {/* Agent figures */}
        {activeAgents.map((agent, i) => (
          <ClaudeFigure
            key={`fig-${agent.name}`}
            x={startX + i * spacing}
            y={figureBaseY}
            agent={agent}
            tick={tick}
            index={i}
            entryTick={entryTicks[i] || 0}
          />
        ))}

        {/* Sparkles */}
        {sparkles
          .filter((s) => tick - s.born < 30)
          .map((s, i) => (
            <Sparkle key={i} x={s.x} y={s.y} age={tick - s.born} color={s.color} />
          ))}
      </svg>

      {/* Mode buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#0e0e1e",
          borderTop: "1px solid #1a1a2e",
          flexWrap: "wrap",
        }}
      >
        {MODES.map((m, idx) => (
          <button
            key={m.label}
            onClick={() => switchMode(idx)}
            style={{
              background: idx === modeIdx ? "#1a1a2e" : "#0a0a1a",
              color: idx === modeIdx ? "#E07045" : "#555570",
              border: `1px solid ${idx === modeIdx ? "#E07045" : "#2a2a3e"}`,
              borderRadius: 4,
              padding: "6px 14px",
              fontFamily: "monospace",
              fontSize: 13,
              cursor: "pointer",
              transition: "none",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
