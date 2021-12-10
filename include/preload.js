const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
        let validChannels = ["go","external","title"];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive: (channel, func) => {
        let validChannels = ["show","notfound","updateAddress","disableAddress","enableAddress"];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
  }
);
