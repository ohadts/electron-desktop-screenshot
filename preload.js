
const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
    "electron", {
        send: ipcRenderer.send,
        onAsynchronousMessage: (fn) => {
            ipcRenderer.on('screenshot', (event, ...args) => fn(...args));
          }
    }
);
