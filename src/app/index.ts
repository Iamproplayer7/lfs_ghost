import { BrowserWindow } from 'electron';
import { OverlayController } from 'electron-overlay-window';

import './memory.js';

type TApp = {
    window: false | BrowserWindow;
    start: () => void;
}

export const App: TApp = {
    window: false,

    start() {
        if(this.window) return;

        this.window = new BrowserWindow({
            frame: false,
            show: true,
            transparent: true,
            fullscreen: true,
            resizable: false,
            webPreferences: {
                preload: 'C:/Users/Admin/Desktop/lfsoverlay/src/view/preload.js',
                nodeIntegration: true,
                contextIsolation: true
            }
        });

        this.window.loadFile('./view/index.html');
        // dev tools
        //this.window.webContents.openDevTools({ mode: 'detach' });

        OverlayController.attachByTitle(this.window, 'Live for Speed');
        OverlayController.focusTarget()
    }
}