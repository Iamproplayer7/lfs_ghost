import fs from 'fs';
import { Vector3 } from 'tsinsim';

import { app } from 'electron';
import path from 'path';


const MAIN_PATH = path.join(app.getPath('userData'), '/data');

type LapData = { id: string, track: string, time: number, path: { time: number, pos: Vector3, heading: number }[] }

class ConfigHandler {
    loaded: boolean = false;
    InSim: { port: number, password: string } = { port: 29999, password: '' };
    laps: LapData[] = [];

    async load() {
        return new Promise((resolve) => {
            // create if data folder does not exist
            if(!fs.existsSync(MAIN_PATH)) {
                fs.mkdirSync(MAIN_PATH);
            }

            // create if laps folder does not exist
            if(!fs.existsSync(`${MAIN_PATH}/laps`)) {
                fs.mkdirSync(`${MAIN_PATH}/laps`);
            }

            // create if config file does not exist
            if(!fs.existsSync(`${MAIN_PATH}/config.json`)) {
                this.saveToFile();
            }

            // load config
            const data = fs.readFileSync(`${MAIN_PATH}/config.json`, 'utf-8');

            try {
                const config = JSON.parse(data.toString());

                this.InSim = config.InSim;
                this.loaded = true;

                this.saveToFile();
            }
            catch(e) {
                console.log(e)
            }

            return resolve(true);
        })
    }

    async loadLaps() {
        return new Promise((resolve) => {
            // create if data folder does not exist
            if(!fs.existsSync(MAIN_PATH)) {
                fs.mkdirSync(MAIN_PATH);
            }

            // create if laps folder does not exist
            if(!fs.existsSync(`${MAIN_PATH}/laps`)) {
                fs.mkdirSync(`${MAIN_PATH}/laps`);
            }

            // load config
            const fileNames = fs.readdirSync(`${MAIN_PATH}/laps`);
            for(const fileName of fileNames) {
                try {
                    const data = fs.readFileSync(`${MAIN_PATH}/laps/${fileName}`, 'utf-8');
                    const dataJSON = JSON.parse(data.toString()) as LapData;

                    dataJSON.path = dataJSON.path.map((p) => { p.pos = new Vector3(p.pos); return p; })
                    this.laps.push(dataJSON);
                }
                catch(e) { console.log(e) }
            }

            return resolve(true);
        })
    }

    saveToFile() {
        fs.writeFileSync(`${MAIN_PATH}/config.json`, JSON.stringify({ 
            InSim: this.InSim
        }, null, 4));
    }

    loadLap(id: string, track: string) {
        return this.laps.find(l => l.id === id && l.track === track);
    }

    saveLapToFile(id: string, track: string, time: number, path: { time: number, pos: Vector3, heading: number }[]) {
        fs.writeFileSync(`${MAIN_PATH}/laps/${id}_${track}.json`, JSON.stringify({ 
            id: id,
            track: track,
            time: time,
            path: path
        }, null, 4));
    }
}

export const Config = new ConfigHandler;
await Config.load();
await Config.loadLaps();