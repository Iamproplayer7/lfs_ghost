// @ts-ignore
import memoryjs from '../memoryjs/index.js';
import { AppA } from './index_app.js';

let process: any = false;

const getProcess = () => {
    if(process) return process;

    try {
        process = memoryjs.openProcess('LFS.exe');
        return process;
    }
    catch(e) {
        return false;
    }
}

export const getCameraData = () => {
    const process = getProcess();
    if(!process || !process.handle) {
        AppA.updateLFSStatus(false);
        return { fov: [0, 0, 0], pos: { x: 0, y: 0, z: 0 }, matrix: new Array(9).fill(0) }
    }
   
    AppA.updateLFSStatus(true);

    const fov = [
        memoryjs.readMemory(process.handle, 0x0089F52C, memoryjs.FLOAT),
        memoryjs.readMemory(process.handle, 0x006A67C8, memoryjs.FLOAT),
        memoryjs.readMemory(process.handle, 0x006A5030, memoryjs.FLOAT),
    ];

    const pos_buffer = memoryjs.readBuffer(process.handle, 0x00D47E00, 3*4);
    const pos = { x: pos_buffer.readFloatLE(0), y: pos_buffer.readFloatLE(4), z: pos_buffer.readFloatLE(8) };
    
    const mstart = 0x0086B890;
    const matrix_buffer = memoryjs.readBuffer(process.handle, mstart, 12*4);
    const matrix = [];
    for(var i = 0; i < 12; i++) {
        matrix.push(matrix_buffer.readFloatLE(4*i));
    }

    return {
        fov,
        pos,
        matrix: [
            matrix[0], matrix[1], matrix[2],
            matrix[4], matrix[5], matrix[6],
            matrix[8], matrix[9], matrix[10]
        ],
        d: memoryjs.readMemory(process.handle, 0x0086CABC, memoryjs.BYTE),
        d2: memoryjs.readMemory(process.handle, 0x0086C8C8, memoryjs.FLOAT),
        d3: memoryjs.readMemory(process.handle, 0x0086C8CC, memoryjs.FLOAT),        
    }
}