import { Config } from "../../../app/config.js";
import { App } from "../../../app/index.js";
import { AppA } from "../../../app/index_app.js";
import { getCameraData } from "../../../app/memory.js";
import { Event, EventType, InSimFlags, Interval, IS_CPP, IS_TINY, Packet, PacketType, Server, StateFlags, TinyType } from "../../main/index.js";


const server = Server.create({
    Admin: Config.InSim.password,                      
    Flags: InSimFlags.ISF_LOCAL + InSimFlags.ISF_MCI + InSimFlags.ISF_CON + InSimFlags.ISF_MSO_COLS,
    Interval: 1, 
    InSimVer: 10, 
    IName: 'VISM VIEW',
    Prefix: 33,
    //UDPPort: 5555             
});
server.connect('127.0.0.1', Config.InSim.port);

/* UDP MCI PACKETS HANDLING */

/*import dgram from 'dgram';
const stream = dgram.createSocket('udp4');
stream.bind(5555, '127.0.0.1');
stream.on('message', (data) => {
    server.InSimHandle.deserializePacket(data);
})*/

/* CAM MODE REQUEST INSIM */
// to slow down requests, because it don't need to be fast response
Event.on(EventType.SERVER_CONNECTED, (server: Server) => {
    AppA.updateInSimStatus(true);

    Interval.set('server-cpp', () => {
        Packet.send(server, new IS_TINY({ SubT: TinyType.TINY_SCP, ReqI: 2 }))
    }, 100);
});

Event.on(EventType.SERVER_DISCONNECTED, (server: Server) => {
    AppA.updateInSimStatus(false);
});

let camMode = 0;
Packet.on(PacketType.ISP_CPP, async (data: IS_CPP) => {
    if(data.ReqI !== 2) return;

    camMode = (data.Flags & StateFlags.ISS_SHIFTU) !== 0 ? 5 : data.InGameCam;
})
/* */

// send camera & matrix & fov
setInterval(() => {
    if(!App.window) return;
    
    const cam = getCameraData();

    // some third camera fix
    if(cam.d === 0) {
        return;
    }

    // some camera rendering
    if(cam.d2 === 512 || cam.d3 === 512 || cam.d2 === 64 || cam.d3 === 64 || cam.d2 === 32 || cam.d3 === 32) {
        return;
    }

    const fov = camMode == 1 || camMode == 2 ? 52 : (camMode == 4 ? cam.fov[1] : (camMode == 5 ? cam.fov[2] : cam.fov[0]))
    App.window.webContents.send('CAMERA', fov, cam.pos, cam.matrix);
}, 1);

import './ghost.js';
import './intervals.js'