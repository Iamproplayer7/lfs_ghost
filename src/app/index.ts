import { BrowserWindow } from 'electron';
import { OverlayController } from 'electron-overlay-window';

import './memory.js';

// get current working dir
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
                preload: path.join(__dirname,  '/../view/preload.js'),
                nodeIntegration: true,
                contextIsolation: true
            }
        });

        this.window.loadFile(path.join(__dirname,  '/../view/index.html'));
        // dev tools
        //this.window.webContents.openDevTools({ mode: 'detach' });

        OverlayController.attachByTitle(this.window, 'Live for Speed');
        OverlayController.focusTarget()
    }
}