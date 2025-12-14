const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('IPC', {
    on: (name, callback) => {
        ipcRenderer.on(name, (e, ...args) => {
            callback(...args);
        });
    }
})