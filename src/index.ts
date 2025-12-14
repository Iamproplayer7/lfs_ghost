import { app } from 'electron';
import { App } from './app/index.js';

import './vism/plugins/core/index.js';

app.on('ready', () => {
    App.start();
});

app.on('window-all-closed', () => {
    app.quit();
});
