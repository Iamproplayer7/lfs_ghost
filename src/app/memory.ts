// @ts-ignore
import memoryjs from '../memoryjs/index.js';

const process = memoryjs.openProcess('LFS.exe');

export const getCameraData = () => {
    if(!process || !process.handle) return { fov: [0, 0, 0], pos: { x: 0, y: 0, z: 0 }, matrix: new Array(9).fill(0), view_plid: 0, d: 0 }
   
    // viewing vehicle PLID
    const view_plid = memoryjs.readMemory(process.handle, 0x0082C24F, memoryjs.UBYTE);

    const fov = [
        memoryjs.readMemory(process.handle, 0x0089F52C, memoryjs.FLOAT),
        memoryjs.readMemory(process.handle, 0x006A67C8, memoryjs.FLOAT),
        memoryjs.readMemory(process.handle, 0x006A5030, memoryjs.FLOAT),
    ];

    const pos_buffer = memoryjs.readBuffer(process.handle, 0x00D47D80, 3*4);
    const pos = { x: pos_buffer.readFloatLE(0), y: pos_buffer.readFloatLE(4), z: pos_buffer.readFloatLE(8) };
    
    const mstart = 0x0086B890;
    const matrix = [];
    for(var i = 0; i < 16; i++) {
        matrix.push(memoryjs.readMemory(process.handle, mstart+0x4*i, memoryjs.FLOAT));
    }

    return {
        view_plid: view_plid,
        fov,
        pos,
        matrix: [
            matrix[0], matrix[1], matrix[2],
            matrix[4], matrix[5], matrix[6],
            matrix[8], matrix[9], matrix[10]
        ]
    }
}