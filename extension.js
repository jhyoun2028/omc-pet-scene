const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function activate(context) {
  let webviewView = null;
  let agentCount = 1;
  let recentEdits = [];
  let lastTaskKey = "";
  const recentSaves = [];
  const recentOpens = [];

  // Register as a panel webview view (lives in bottom bar next to Terminal)
  const provider = {
    resolveWebviewView(view) {
      webviewView = view;
      view.webview.options = { enableScripts: true };

      const scenePath = path.join(context.extensionPath, "omc-pet-scene.jsx");
      const sceneCode = fs.readFileSync(scenePath, "utf-8");
      view.webview.html = buildHTML(sceneCode);

      sendProjectInfo();
      detectAgents();

      view.onDidDispose(() => { webviewView = null; });
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("omcPet.view", provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Also keep the command to manually open as a panel if desired
  context.subscriptions.push(
    vscode.commands.registerCommand("omcPet.show", () => {
      // Focus the panel view
      vscode.commands.executeCommand("omcPet.view.focus");
    })
  );

  // ── Agent Detection ────────────────────────────────────────
  function countClaudeProcesses() {
    return new Promise((resolve) => {
      // Count actual claude/anthropic agent processes running on the system
      exec(
        "ps aux | grep -iE '(claude|anthropic|subagent|ccagent)' | grep -v grep | wc -l",
        { timeout: 2000 },
        (err, stdout) => {
          if (err) return resolve(0);
          resolve(parseInt(stdout.trim(), 10) || 0);
        }
      );
    });
  }

  async function detectAgents() {
    if (!webviewView) return;

    // Count Claude-related terminals in VS Code
    const claudeTerminals = vscode.window.terminals.filter((t) => {
      const name = (t.name || "").toLowerCase();
      return (
        name.includes("claude") || name.includes("agent") ||
        name.includes("task") || name.includes("mcp") ||
        name.includes("subagent") || name.includes("executor")
      );
    });

    // Count actual system processes
    const processCount = await countClaudeProcesses();

    const now = Date.now();
    recentEdits = recentEdits.filter((t) => now - t < 5000);
    const editVelocity = recentEdits.length;

    // Use the higher of: terminal count, process count (capped at 8 since 1 is always the main)
    const externalAgents = Math.max(claudeTerminals.length, Math.min(processCount, 8));
    // Always at least 1 (main autopilot) + detected sub-agents
    let detected = Math.max(1, externalAgents);
    // Edit velocity can bump it up slightly (active coding = more workers)
    if (editVelocity >= 8) detected = Math.max(detected, detected + 1);
    detected = Math.min(detected, 9); // cap at roster size

    if (detected !== agentCount) {
      agentCount = detected;
      try {
        webviewView.webview.postMessage({ type: "setAgentCount", count: agentCount });
      } catch (e) {}
    }
  }

  // ── Activity Tracking ──────────────────────────────────────
  function trackSave(doc) {
    const name = path.basename(doc.fileName);
    if (name.startsWith(".") || doc.uri.scheme !== "file") return;
    recentSaves.unshift({ name, time: Date.now() });
    if (recentSaves.length > 10) recentSaves.pop();
  }

  function trackOpen(editor) {
    if (!editor) return;
    const name = path.basename(editor.document.fileName);
    if (name.startsWith(".") || editor.document.uri.scheme !== "file") return;
    if (recentOpens[0]?.name === name) return;
    recentOpens.unshift({ name, time: Date.now() });
    if (recentOpens.length > 8) recentOpens.pop();
  }

  async function getGitChanges() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return [];
    return new Promise((resolve) => {
      exec("git diff --name-only HEAD 2>/dev/null | head -8",
        { cwd: folders[0].uri.fsPath },
        (err, stdout) => {
          if (err || !stdout) return resolve([]);
          resolve(stdout.trim().split("\n").filter(Boolean).map((f) => path.basename(f)));
        });
    });
  }

  async function sendProjectInfo() {
    if (!webviewView) return;
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return;

    const projectName = folders[0].name;
    const now = Date.now();
    const tasks = [];

    const active = vscode.window.activeTextEditor;
    if (active && active.document.uri.scheme === "file") {
      tasks.push(`focused on ${path.basename(active.document.fileName)}...`);
    }

    for (const d of vscode.workspace.textDocuments.filter((d) => d.isDirty && d.uri.scheme === "file")) {
      tasks.push(`editing ${path.basename(d.fileName)}...`);
    }

    for (const s of recentSaves.filter((s) => now - s.time < 30000)) {
      tasks.push(`saved ${s.name}...`);
    }

    for (const o of recentOpens.filter((o) => now - o.time < 60000).slice(0, 4)) {
      tasks.push(`reviewing ${o.name}...`);
    }

    try {
      for (const f of (await getGitChanges()).slice(0, 5)) {
        tasks.push(`changed ${f}...`);
      }
    } catch (e) {}

    for (const t of vscode.window.terminals.slice(0, 9)) {
      const name = (t.name || "").trim();
      if (!name) continue;
      const lower = name.toLowerCase();
      if (lower.includes("claude") || lower.includes("agent") || lower.includes("subagent") || lower.includes("executor")) {
        tasks.push(`${name}...`);
      }
    }

    if (tasks.length < 4) {
      tasks.push(`building ${projectName}...`, "checking types...", "scanning deps...");
    }

    const unique = [...new Set(tasks)];
    const key = unique.join("|");
    if (key !== lastTaskKey) {
      lastTaskKey = key;
      try {
        webviewView.webview.postMessage({ type: "projectName", name: projectName });
        webviewView.webview.postMessage({ type: "projectTasks", tasks: unique });
      } catch (e) {}
    }
  }

  // ── Watchers ───────────────────────────────────────────────
  const watchers = [
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme === "file") recentEdits.push(Date.now());
      detectAgents();
      sendProjectInfo();
    }),
    vscode.workspace.onDidSaveTextDocument((doc) => { trackSave(doc); sendProjectInfo(); }),
    vscode.window.onDidChangeActiveTextEditor((ed) => { trackOpen(ed); sendProjectInfo(); }),
    vscode.window.onDidOpenTerminal(() => detectAgents()),
    vscode.window.onDidCloseTerminal(() => setTimeout(detectAgents, 500)),
    vscode.workspace.onDidCreateFiles(() => { sendProjectInfo(); detectAgents(); }),
    vscode.workspace.onDidDeleteFiles(() => sendProjectInfo()),
  ];

  const interval = setInterval(() => { detectAgents(); sendProjectInfo(); }, 3000);

  context.subscriptions.push(...watchers, { dispose: () => clearInterval(interval) });
}

function buildHTML(sceneJsx) {
  let code = sceneJsx
    .replace(/^import\s.*;\s*/gm, "")
    .replace(/^export\s+default\s+/m, "const OMCScene = ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: transparent; overflow: hidden; pointer-events: none; }
    #root { width: 100%; pointer-events: none; }
    #root svg { pointer-events: none; }
    /* Only the tiny corner controls opt back in. */
    #root button { pointer-events: auto; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <script type="text/babel">
    const { useState, useEffect, useCallback } = React;

    ${code}

    ReactDOM.createRoot(document.getElementById("root")).render(
      React.createElement(OMCScene)
    );
  <\/script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
