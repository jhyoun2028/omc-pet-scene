const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

let win;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;

  // Compact strip in bottom-right
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

  // Clicks pass through to the app underneath (e.g. VS Code). Only the
  // corner control buttons opt back in — enforced by pointer-events CSS in
  // media/omc-overlay.html.
  win.setIgnoreMouseEvents(true, { forward: true });

  // Load the shared webview bundle (same artifact the VS Code extension
  // uses) via loadFile. No runtime Babel, no CDN dependencies.
  win.loadFile(path.join(__dirname, "media", "omc-overlay.html"));

  win.on("closed", () => { win = null; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
