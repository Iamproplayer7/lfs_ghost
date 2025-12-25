import fs from 'fs';
import { Vector3 } from 'tsinsim';

import { app } from 'electron';
import path from 'path';


const MAIN_PATH = path.join(app.getPath('userData'), '/data');

type LapData = { id: string, track: string, time: number, path: { time: number, pos: Vector3, heading: number, speed: number }[] }


const lerp = (a: number, b: number, t: number) => {
    return a + (b - a) * t;
}

export const addIntermediatePoints = (path: LapData['path'], count = 3) => {
    const result: LapData['path'] = [];

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        result.push(p1);

        for (let j = 1; j <= count; j++) {
            const t = j / (count + 1);

            result.push({
                time: lerp(p1.time, p2.time, t),
                pos: new Vector3(lerp(p1.pos.x, p2.pos.x, t),lerp(p1.pos.y, p2.pos.y, t),lerp(p1.pos.z, p2.pos.z, t)),
                heading: lerp(p1.heading, p2.heading, t),
                speed: lerp(p1.speed, p2.speed, t),
            });
        }
    }

    result.push(path[path.length - 1]);

    return result;
}

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

                    dataJSON.path = dataJSON.path.map((p) => { p.pos = new Vector3(p.pos); p.speed = p.speed === undefined ? 0 : p.speed; return p; })
                    //dataJSON.path = addIntermediatePoints(dataJSON.path.map((p) => { p.pos = new Vector3(p.pos); p.speed = p.speed === undefined ? 0 : p.speed; return p; }))

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