import { BrowserWindow, ipcMain } from "electron";

export const IPC = {
    emit: (window: BrowserWindow, name: string, data: any) => {
        window.webContents.send(name, data);
    },
    on: (name: string, callback: (arg: any) => void) => {
        ipcMain.on(name, (arg: any) => {
            callback(arg);
        })
    }
}