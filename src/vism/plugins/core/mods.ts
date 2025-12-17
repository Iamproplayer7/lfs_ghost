import fs from 'fs';

// get current working dir
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


type Pos = { x: number, y: number, z: number };

export type CarInfo = {
    id:   string;
    data: {
        wheels:                   {
            pos: Pos;
        }[];
    };
}

let cached: false | CarInfo[] = false;
export const getModBinData = (id: string) => {
    if(!cached) {
        cached = JSON.parse(fs.readFileSync(path.join(__dirname, '/mods.json'), 'utf-8')) as CarInfo[];
    }

    if(!cached) return false;

    const data = cached.find((m) => m.id === id);
    return data ? data.data : false;
}