
const {
    contextBridge,
    ipcRenderer
} = require("electron");
const { writeFile } = require("fs");

contextBridge.exposeInMainWorld("electron", {
  onAsynchronousMessage: (fn) => {
    ipcRenderer.on("screenshot", (event, ...args) => fn(...args));
  },
  saveFile: (base64) => ipcRenderer.invoke("SAVE_FILE", base64),
  copyImage: (base64) => ipcRenderer.invoke("COPY_IMAGE", base64),
});
