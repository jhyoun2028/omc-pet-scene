const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;

  const winW = 450;
  const winH = 140;

  win = new BrowserWindow({
    width: winW,
    height: winH,
    x: screenW - winW - 10,
    y: screenH - winH - 10,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Click-through: mouse events pass to windows underneath
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setVisibleOnAllWorkspaces(true);

  // Load the scene
  const scenePath = path.join(__dirname, "omc-pet-scene.jsx");
  const sceneCode = fs.readFileSync(scenePath, "utf-8");

  let code = sceneCode
    .replace(/^import\s.*;\s*/gm, "")
    .replace(/^export\s+default\s+/m, "const OMCScene = ");

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" />
<style>
  * { margin:0; padding:0; }
  html, body { background: transparent !important; overflow: hidden; }
  #root { background: transparent; }
</style></head><body>
<div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel">
  const { useState, useEffect, useCallback, useRef } = React;
  ${code}
  ReactDOM.createRoot(document.getElementById("root")).render(
    React.createElement(OMCScene)
  );
<\/script></body></html>`;

  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  win.on("closed", () => { win = null; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
