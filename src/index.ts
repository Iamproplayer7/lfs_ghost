import { app, Menu, Tray } from 'electron';
import { App } from './app/index.js';
import { AppA } from './app/index_app.js';

import './vism/plugins/core/index.js';

// get current working dir
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.on('ready', () => {
    App.start();
    AppA.start();

    const tray = new Tray(path.join(path.join(__dirname, '/iconp.ico')))
    tray.setToolTip('LFSGhost');
    tray.setContextMenu(Menu.buildFromTemplate([{
        label: 'Exit',
        type: 'normal',
        click: () => app.quit()
    }]))
});

app.on('quit', () => {
    App.window = false;
    AppA.window = false;
});

app.on('window-all-closed', () => {
    App.window = false;
    AppA.window = false;
    app.quit();
});
