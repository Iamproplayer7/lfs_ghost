import { BrowserWindow, ipcMain } from 'electron';
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
    ready: boolean;
    cache: { name: string, args: any[] }[];
    start: () => void;
    send: (name: string, ...args: any) => void;
}

export const App: TApp = {
    window: false,
    ready: false,
    cache: [],

    start() {
        if(this.window) return;

        this.window = new BrowserWindow({
            frame: false,
            show: false,
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
        this.window.on('closed', () => { this.window = false; });

        // dev tools
        //this.window.webContents.openDevTools({ mode: 'detach' });

        // page load
        ipcMain.on('load', (event, arg) => {
            this.ready = true;

            if(this.cache.length > 0) {
                for(const ev of this.cache) {
                    if(!this.window) return;
                    this.window.webContents.send(ev.name, ...ev.args);
                }

                this.cache = [];
            }
        });

        OverlayController.attachByTitle(this.window, 'Live for Speed');
    },

    send(name: string, ...args: any) {
        if(!this.window || !this.ready) {
            this.cache.push({ name: name, args: args });
            return;
        }

        this.window.webContents.send(name, ...args);
    }
}