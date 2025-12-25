const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('IPC', {
    on: (name, callback) => {
        ipcRenderer.on(name, (e, ...args) => {
            callback(...args);
        });
    },
    emit: (name, ...args) => {
        ipcRenderer.send(name, ...args);
    }
})