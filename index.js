const { createWindow } = require("./main");
const { app } = require("electron");
require("./app/config/Conexion");
require("electron-reload")(__dirname);

app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  const { BrowserWindow } = require("electron");
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
