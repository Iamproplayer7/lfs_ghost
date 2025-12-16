import { app, BrowserWindow, shell } from 'electron';
import { IPC } from './ipc.js';

// get current working dir
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type TApp = {
    window: false | BrowserWindow;
    LFSStatus: boolean;
    InSimStatus: boolean;
    start: () => void;
    updateLFSStatus: (status: boolean) => void;
    updateInSimStatus: (status: boolean) => void;
}

const MAIN_PATH = path.join(app.getPath('userData'), '/data');
const VERSION = '1.0.1';

export const AppA: TApp = {
    window: false,
    LFSStatus: false,
    InSimStatus: false,

    start() {
        if(this.window) return;

        Config.load();

        this.window = new BrowserWindow({
            width: 500,
            height: 200,
            center: true,
            // @ts-ignore
            allowEval: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            ...{ fullscreenable: false, frame: false, transparent: false, resizable: false }
        });

        this.window.removeMenu();
        this.window.setTitle('LFSGhost');

        this.window.loadFile(path.join(__dirname,  '/../view_app/index.html'));
        this.window.on('closed', () => { this.window = false; });

        // dev tools
        //this.window.webContents.openDevTools({ mode: 'detach' });

        // WINDOW
        IPC.on('pageLoaded', () => { 
            if(!this.window) return;
                
            IPC.emit(this.window, 'update_version', { version: VERSION });
            IPC.emit(this.window, 'update_status', { lfs: this.LFSStatus, insim: this.InSimStatus });
        });

        IPC.on('exit', () => { 
            if(this.window) {
                this.window.destroy();
                this.window = false;
                app.quit();
            }
        });

        IPC.on('minimize', () => { 
            if(this.window) this.window.minimize(); 
        });

        IPC.on('open_config', () => { 
            shell.openPath(MAIN_PATH); 
        });

        IPC.on('open_github', () => { 
            shell.openExternal('https://github.com/Iamproplayer7/lfs_ghost');
        });
    },

    updateLFSStatus(status: boolean)  {
        if(!this.window) return;
        if(status == this.LFSStatus) return; 

        this.LFSStatus = status;
        IPC.emit(this.window, 'update_status', { lfs: this.LFSStatus, insim: this.InSimStatus });
    },

    updateInSimStatus(status: boolean)  {
        if(!this.window) return;
        if(status == this.InSimStatus) return; 
        
        this.InSimStatus = status;
        IPC.emit(this.window, 'update_status', { lfs: this.LFSStatus, insim: this.InSimStatus });
    }   
}

import fs from 'fs';

class ConfigHandler {
    loaded: boolean = false;
    InSim: { port: number, password: string } = { port: 29999, password: '' };


    load() {
        // create if data folder does not exist
        if(!fs.existsSync(MAIN_PATH)) {
            fs.mkdirSync(MAIN_PATH);
        }

        // create if config file does not exist
        if(!fs.existsSync(MAIN_PATH + '/config.json')) {
            this.saveToFile();
        }

        // load config
        const data = fs.readFileSync(MAIN_PATH + '/config.json', 'utf-8');

        try {
            var config = JSON.parse(data.toString());

            this.InSim = config.InSim;
            this.loaded = true;

            this.saveToFile();
        }
        catch(e) {
            console.log(e)
            return true;
        }

        return false;
    }

    saveToFile() {
        fs.writeFileSync(MAIN_PATH + '/config.json', JSON.stringify({ 
            InSim: this.InSim
        }, null, 4));
    }
}

export const Config = new ConfigHandler;