import { IS_LAP, IS_STA, PacketType, Vector3 } from "tsinsim";
import { Button, Event, EventType, Interval, Packet, Player, PlayerGetter, Vehicle } from "../../main/index.js";
import { getModBinData } from "./mods.js";
import { addIntermediatePoints, Config } from "../../../app/config.js";
import { App } from "../../../app/index.js";
import { ButtonType } from "../../main/classes/Button.js";
import { Utils } from "./utils.js";

/* GHOST VEHICLE */
const bestLap = {
    time: 0 as number,
    path: [] as { time: number, pos: Vector3, heading: number, speed: number }[] 
};

const currentLap = {
    status: false as boolean,
    timeStart: 0 as number,
    path: [] as { time: number, pos: Vector3, heading: number, speed: number }[]
}

const LocalVehicle = {
    vehicle: false as Vehicle | false,
    bin: false as ReturnType<typeof getModBinData>,
};

let TRACK = '';
Packet.on(PacketType.ISP_STA, async (data: IS_STA) => {
    if(TRACK === data.Track) return;
    TRACK = data.Track;
    
    // current/best lap reset
    currentLap.status = false;
    bestLap.time = 0;
    bestLap.path = [];

    // load new best lap
    const lap = Config.laps.find((l) => l.id === (LocalVehicle.vehicle ? LocalVehicle.vehicle.getName() : '') && l.track === data.Track);
    if(lap) {
        bestLap.time = lap.time;
        bestLap.path = lap.path;
    }
})

Packet.on(PacketType.ISP_LAP, (data: IS_LAP) => {
    if(!LocalVehicle.vehicle) return;
    if(LocalVehicle.vehicle.getPLID() !== data.PLID) return;

    if((bestLap.time === 0 || data.LTime < bestLap.time) && currentLap.status) {
        bestLap.time = data.LTime;
        bestLap.path = addIntermediatePoints(currentLap.path);

        Config.saveLapToFile(LocalVehicle.vehicle.getName(), TRACK, data.LTime, currentLap.path);
    }
 
    currentLap.status = true;
    currentLap.timeStart = performance.now();
    currentLap.path = [];
});

Event.on(EventType.VEHICLE_CREATED, (vehicle: Vehicle, player: Player) => {
    if(!player.isLocal()) return;

    LocalVehicle.vehicle = vehicle;
    LocalVehicle.bin = getModBinData(vehicle.getName());

    // current/best lap reset
    currentLap.status = false;
    bestLap.time = 0;
    bestLap.path = [];

    const lap = Config.loadLap(vehicle.getName(), TRACK);
    if(lap) {
        currentLap.status = true;
        bestLap.time = lap.time;
        bestLap.path = lap.path;
    }
});

Event.on(EventType.VEHICLE_DESTROYED, (vehicle: Vehicle, player: Player) => {
    if(!player.isLocal()) return;

    LocalVehicle.vehicle = false;
    LocalVehicle.bin = false;

    // current/best lap reset
    currentLap.status = false;
    bestLap.time = 0;
    bestLap.path = [];
});

Interval.set('path-record', () => {
    if(!LocalVehicle.vehicle) return;
    if(!currentLap.status) return;
    
    const date = performance.now();
    const lastPoint = currentLap.path[currentLap.path.length-1];
    if(lastPoint) {
        if(date-currentLap.timeStart === lastPoint.time && LocalVehicle.vehicle.getPosition().distanceTo(lastPoint.pos) === 0) return;
    }

    currentLap.path.push({ time: date-currentLap.timeStart, pos: LocalVehicle.vehicle.getPosition(), heading: LocalVehicle.vehicle.getHeading(), speed: LocalVehicle.vehicle.getSpeed() })
}, 50);
    
Interval.set('server-ghost', () => {
    if(!LocalVehicle.vehicle) return;
    if(!currentLap.status) return;
    if(bestLap.time < 1) return;

    const ghostTime = performance.now()-currentLap.timeStart;

    let closestPoint: boolean | { time: number, pos: Vector3, heading: number, speed: number } = false;
    let closestTimeDiff = 0;

    for(const point of bestLap.path) {
        const diff = Math.abs(ghostTime-point.time);

        if(closestPoint === false || diff < closestTimeDiff) {
            closestPoint = point;
            closestTimeDiff = diff;
        }
    }

    if(closestPoint === false) return;

    const wheelsPos = LocalVehicle.bin ? LocalVehicle.bin.wheels : [
        { pos: new Vector3(    -0.8,   -1.4,   -0.2) },
        { pos: new Vector3(     0.8,   -1.4,   -0.2) },
        { pos: new Vector3(     0.8,    1.4,   -0.2) },
        { pos: new Vector3(    -0.8,    1.4,   -0.2) },
    ];
    
    const wheels_draw = [];
    
    const heading = closestPoint.heading * (Math.PI/180);
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    for(const wheel of wheelsPos) {
        const final = new Vector3(
            closestPoint.pos.x + (wheel.pos.x * cosH + wheel.pos.y * sinH),
            closestPoint.pos.y + (wheel.pos.x * sinH - wheel.pos.y * cosH),
            closestPoint.pos.z + wheel.pos.z
        );

        wheels_draw.push({ type: 'point', pos: final, color: 0x0000ff, heading: heading, wheel: true })
    }

    const idx = bestLap.path.indexOf(closestPoint);
    const rangeDistance = 100;

    let idxMin = 0;
    for(var i = Math.max(0, idx-200); i < idx; i++) {
        const dist = bestLap.path[i].pos.distanceTo(bestLap.path[idx].pos);

        if(dist < rangeDistance) {
            idxMin = i;
            break;
        }
    }

    let idxMax = 0;
    for(var i = Math.min(idx+200, bestLap.path.length-1); i >= idx; i--) {
        const dist = bestLap.path[i].pos.distanceTo(bestLap.path[idx].pos);

        if(dist < rangeDistance) {
            idxMax = i;
            break;
        }
    }

    const path = [...bestLap.path.slice(idxMin, idxMax)];
    if(App.window) {
        App.window.webContents.send('DEBUG_DRAW', [
            ...wheels_draw,
            { type: 'point', pos: bestLap.path[idx].pos, color: 0x00ff00, heading: bestLap.path[idx].heading * (Math.PI/180) },
            { type: 'path', path: path.map(p => { return { pos: p.pos, color: Utils.speedToHexColor(p.speed, bestLap.path[idx].speed ) }} ) },
            //{ type: 'path', path: path.map(p => p.pos) },
        ]);
    }
}, 10);


Interval.set('server-buttons', () => {
    const player = PlayerGetter.all.find((p) => p.isLocal());
    if(!player) return;
    
    Button.create(ButtonType.SIMPLE, player, 'BEST LAP TYPE', 'GHOST', 10, 5, 20, 89, bestLap.time > 0 ? '^7' + Utils.toLFSTime(bestLap.time) : '^1-', 32);
    Button.create(ButtonType.SIMPLE, player, 'BEST LAP TYPE TITLE', 'GHOST', 10, 3, 25, 89, '^3Best lap', 32);

    Button.create(ButtonType.SIMPLE, player, 'RECORDING', 'GHOST', 10, 4, 20, 100, currentLap.status ? '^2Recording' : '^1Waiting...', 32);
}, 100);