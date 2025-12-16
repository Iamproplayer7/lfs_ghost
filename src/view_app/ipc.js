const { ipcRenderer } = require('electron');

export const IPC = { 
    emit: (type, data) => {
        ipcRenderer.send(type, data);
    },
    on: (type, callback) => {
        ipcRenderer.on(type, (evt, data) =>{
            callback(data);
        });
    } 
};