const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;

  // Window size — compact strip in bottom-right
  const winW = 500;
  const winH = 160;

  win = new BrowserWindow({
    width: winW,
    height: winH,
    x: screenW - winW - 20,
    y: screenH - winH - 40,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    focusable: false,       // don't steal focus from VS Code
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Make clicks pass through to VS Code underneath
  win.setIgnoreMouseEvents(true, { forward: true });

  // Build the HTML with the scene inline
  const scenePath = path.join(__dirname, "omc-pet-scene.jsx");
  const sceneCode = fs.readFileSync(scenePath, "utf-8");
  const html = buildOverlayHTML(sceneCode);

  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  win.on("closed", () => { win = null; });
}

function buildOverlayHTML(sceneJsx) {
  let code = sceneJsx
    .replace(/^import\s.*;\s*/gm, "")
    .replace(/^export\s+default\s+/m, "const OMCScene = ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: transparent !important; overflow: hidden; }
    #root { width: 100vw; height: 100vh; background: transparent; }
    /* Make the SVG background transparent */
    #root > div { background: transparent !important; }
    svg { background: transparent !important; }
  </style>
</head>
<body>
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
  <\/script>
</body>
</html>`;
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
