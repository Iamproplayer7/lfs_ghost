import { App } from "../../../app/index.js";
import { AppA, Config } from "../../../app/index_app.js";
import { getCameraData } from "../../../app/memory.js";
import { ButtonType } from "../../main/classes/Button.js";
import { Button, Event, EventType, InSimFlags, Interval, IS_CPP, IS_LAP, IS_STA, IS_TINY, Packet, PacketType, Player, PlayerFlags, PlayerGetter, Server, StateFlags, TinyType, Vector2, Vector3, Vehicle } from "../../main/index.js";
import { getModBinData } from "./mods.js";
import { Utils } from "./utils.js";

const server = Server.create({
    Admin: Config.InSim.password,                      
    Flags: InSimFlags.ISF_LOCAL + InSimFlags.ISF_MCI + InSimFlags.ISF_CON,
    Interval: 1, 
    InSimVer: 10, 
    IName: 'VISM VIEW',
    Prefix: 33,
    UDPPort: 5555             
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

    const fov = camMode == 1 || camMode == 2 ? 52 : (camMode == 4 ? cam.fov[1] : (camMode == 5 ? cam.fov[2] : cam.fov[0]))
    App.window.webContents.send('CAMERA', fov, cam.pos, cam.matrix);
}, 10);

/* GHOST VEHICLE */
const bestLap = {
    time: 0 as number,
    recordPath: [] as { time: number, pos: Vector3, heading: number }[] 
};

const currentLap = {
    status: false as boolean,
    timeStart: 0 as number,
    recordPath: [] as { time: number, pos: Vector3, heading: number }[]
}

const LocalVehicle = {
    vehicle: false as Vehicle | false,
    bin: false as ReturnType<typeof getModBinData>,
};

let TRACK = '';
Packet.on(PacketType.ISP_STA, async (data: IS_STA) => {
    if(TRACK === data.Track) return;

    TRACK = data.Track;
    currentLap.status = false;
    currentLap.timeStart = 0;
    currentLap.recordPath = [];

    // best lap
    bestLap.time = 0;
    bestLap.recordPath = [];

    const lap = Config.laps.find(l => l.id === (LocalVehicle.vehicle ? LocalVehicle.vehicle.getName() : '') && l.track === data.Track);
    if(lap) {
        bestLap.time = lap.time;
        bestLap.recordPath = lap.path;
    }
})

Packet.on(PacketType.ISP_LAP, (data: IS_LAP) => {
    if(!LocalVehicle.vehicle) return;
    if(LocalVehicle.vehicle.getPLID() !== data.PLID) return;

    if((bestLap.time === 0 || data.LTime < bestLap.time) && currentLap.status) {
        bestLap.time = data.LTime;
        bestLap.recordPath = currentLap.recordPath;

        Config.saveLapToFile(LocalVehicle.vehicle.getName(), TRACK, data.LTime, bestLap.recordPath);
    }
 
    currentLap.status = true;
    currentLap.timeStart = performance.now();
    currentLap.recordPath = [];
});

Event.on(EventType.VEHICLE_CREATED, (vehicle: Vehicle, player: Player) => {
    if(!player.isLocal()) return;

    LocalVehicle.vehicle = vehicle;
    LocalVehicle.bin = getModBinData(vehicle.getName());

    currentLap.status = false;

    const lap = Config.loadLap(vehicle.getName(), TRACK);
    if(lap) {
        bestLap.time = lap.time;
        bestLap.recordPath = lap.path;
    }
    else {
        bestLap.time = 0;
        bestLap.recordPath = [];
    }
});

Event.on(EventType.VEHICLE_DESTROYED, (vehicle: Vehicle, player: Player) => {
    if(!player.isLocal()) return;

    LocalVehicle.vehicle = false;
    LocalVehicle.bin = false;

    currentLap.status = false;
});

Interval.set('path-record', () => {
    if(!LocalVehicle.vehicle) return;
    if(!currentLap.status) return;
    
    const date = performance.now();
    const lastPoint = currentLap.recordPath[currentLap.recordPath.length-1];
    if(lastPoint) {
        if(date-currentLap.timeStart === lastPoint.time && LocalVehicle.vehicle.getPosition().distanceTo(lastPoint.pos) === 0) return;
    }

    currentLap.recordPath.push({ time: date-currentLap.timeStart, pos: LocalVehicle.vehicle.getPosition(), heading: LocalVehicle.vehicle.getHeading() })
}, 1);
    

Interval.set('server-ghost', () => {
    if(!LocalVehicle.vehicle) return;
    if(!currentLap.status) return;
    if(bestLap.time < 1) return;

    const ghostTime = performance.now()-currentLap.timeStart;

    let closestPoint: boolean | { time: number, pos: Vector3, heading: number } = false;
    let closestTimeDiff = 0;

    for(const point of bestLap.recordPath) {
        const diff = Math.abs(ghostTime-point.time);

        if(closestPoint === false || diff < closestTimeDiff) {
            closestPoint = point;
            closestTimeDiff = diff;
        }
    }

    if(closestPoint !== false) {
        const wheels_draw = [];
        
        if(LocalVehicle.bin) {   
            const heading = closestPoint.heading * (Math.PI/180);
            const cosH = Math.cos(heading);
            const sinH = Math.sin(heading);

            for(const wheel of LocalVehicle.bin.wheels) {
                const final = new Vector3(
                    closestPoint.pos.x + (wheel.pos.x * cosH + wheel.pos.y * sinH),
                    closestPoint.pos.y + (wheel.pos.x * sinH - wheel.pos.y * cosH),
                    closestPoint.pos.z + wheel.pos.z
                );

                wheels_draw.push({ type: 'point', pos: final, color: 0x0000ff })
            }
        }

        const idx = bestLap.recordPath.indexOf(closestPoint);

        const range = 400;
        const path = [...bestLap.recordPath.slice(Math.max(0, idx-range), Math.min(idx+range, bestLap.recordPath.length-1)).map(p => p.pos)];

        
        // limit points every 10 metres to save fps
        const newPath = [];
        let lastPoint: false | Vector3 = false;
        for(const p of path) {
            if(lastPoint === false || p.distanceTo(lastPoint) >= 7) {
                newPath.push(p);
                lastPoint = p;
            }
        }

        if(App.window) {
            App.window.webContents.send('DEBUG_DRAW', [
                ...wheels_draw,
                { type: 'point', pos: bestLap.recordPath[idx].pos, color: 0x00ff00 },
                { type: 'path', path: newPath },
            ]);
        }
    }
}, 10);


Interval.set('server-buttons', () => {
    const player = PlayerGetter.all.find((p) => p.isLocal());
    if(!player) return;
    
    Button.create(ButtonType.SIMPLE, player, 'BEST LAP TYPE', 'GHOST', 10, 5, 20, 89, bestLap.time > 0 ? '^7' + Utils.toLFSTime(bestLap.time) : '^1-', 32);
    Button.create(ButtonType.SIMPLE, player, 'BEST LAP TYPE TITLE', 'GHOST', 10, 3, 25, 89, '^3Best lap', 32);

    Button.create(ButtonType.SIMPLE, player, 'RECORDING', 'GHOST', 10, 4, 20, 100, currentLap.status ? '^2Recording' : '^1Waiting...', 32);
}, 100);