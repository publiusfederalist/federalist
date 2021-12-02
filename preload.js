const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
        let validChannels = ["go","external","navigate"];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive: (channel, func) => {
        let validChannels = ["show","toggleButtonOff","toggleButtonOn","updateAddress","enableAddress"];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
  }
);
