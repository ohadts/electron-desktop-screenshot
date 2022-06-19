const electron = require('electron');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  desktopCapturer,
  screen,
  dialog,
  nativeImage,
  clipboard,
} = electron;

const { writeFile } = require("fs");

let tray = null;

const createCaptureWindow = () => {
  const captureWindow = new BrowserWindow({
    width: 1650,
    height: 1050,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });
  captureWindow.loadURL(`file://${__dirname}/mainWindow.html`);
  return captureWindow;
};

app.whenReady().then(() => {
  tray = new Tray(`${__dirname}/iconTemplate.png`);
  desktopCapturer
    .getSources({
      types: ["screen"],
      thumbnailSize: {
        height: screen.getAllDisplays()[1].size.height,
        width: screen.getAllDisplays()[1].size.width,
      },
    })
    .then((sources) => {
      const contextMenu = Menu.buildFromTemplate(
        sources.map((source) => {
          return {
            label: source.name,
            click: () => {
              const captureWindow = createCaptureWindow();
              captureWindow.webContents.once("dom-ready", () => {
                captureWindow.webContents.send(
                  "screenshot",
                  source.thumbnail.toDataURL()
                );
              });
            },
          };
        }).concat([
            {type: 'separator'}, {role: 'quit'}
        ])
      );
      tray.setToolTip("This is my application.");
      tray.setContextMenu(contextMenu);
    });
});
app.on("window-all-closed", () => {});

ipcMain.handle("SAVE_FILE", async (event, base64) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save image",
    defaultPath: `screenshot-${Date.now()}.png`,
  });
  if (!canceled && filePath) {
    writeFile(filePath, base64, "base64", () => {
      console.log("image saved successfully!");
      event.sender.destroy();
    });
  }
});

ipcMain.handle("COPY_IMAGE", async (event, base64) => {
  const image = nativeImage.createFromDataURL(base64);
  clipboard.writeImage(image);
  event.sender.destroy();
});





