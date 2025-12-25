import * as THREE from 'three';
import Stats from './stats_module.js'

// page load
document.addEventListener('DOMContentLoaded', () => {
	setTimeout(() => {
		window.IPC.emit('load');
	}, 500)
});

// stats monitor
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 1000 );
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

// some helpers
const toXZY = (vector) => {
	return new THREE.Vector3(vector.x, vector.z, -vector.y);
}

const camera_packet = { 
	fov: 0, 
	pos: { x: 0, y: 0, z: 0 }, 
	matrix: Array(9) 
};

const camera_packet_timestamp = { 
	get: performance.now(), 
	set: performance.now()-1 
};

let opacity_update_timestamp = performance.now();

// frame
const animate = () => {
	const now = performance.now();

	// check if camera needs update
	if(camera_packet_timestamp.get !== camera_packet_timestamp.set) {
		camera_packet_timestamp.set = camera_packet_timestamp.get;

		camera.fov = 2 * toDeg(Math.atan((9/16) * Math.tan(toRad(camera_packet.fov / 2))))
		camera.position.set(camera_packet.pos.x, camera_packet.pos.y, camera_packet.pos.z);

		const colm = rowToColumnMajor(camera_packet.matrix);

		const m4 = new THREE.Matrix4();
		m4.set(
			colm[0], colm[3], colm[6], 0, // first column: right
			colm[2], colm[5], colm[8], 0, // second column: forward
			colm[1], colm[4], colm[7], 0, // third column: up
			0, 0, 0, 1  // translation row
		);

		if(!(m4.elements[8] === 0 || m4.elements[9] === 0 || m4.elements[9] ===  1 || m4.elements[10] === 1 || m4.elements[10] === 0)) {
			// some workaround to flip
			const euler_ = new THREE.Euler().setFromRotationMatrix(m4);
			euler_.x *= -1;
			euler_.y *= -1;
			//

			camera.rotation.copy( new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromEuler(euler_)));
		}

		camera.updateProjectionMatrix()

		// update opacity on path points
		// performance wise
		if(now-opacity_update_timestamp > 100) {
			opacity_update_timestamp = performance.now();

			for(const line of PGroup.children) {
				const vertex = new THREE.Vector3().fromBufferAttribute(line.geometry.getAttribute('position'), 1);
				line.material.opacity = (-1 / 100 * camera.position.distanceTo(vertex)) + 0.75;
			}
		}
	}

	renderer.render(scene, camera);
	stats.update();
}

renderer.setAnimationLoop(animate);

// camera packet
window.IPC.on('CAMERA', (fov, pos, matrix) => {
	camera_packet.fov = fov;
	camera_packet.pos = toXZY(pos);
	camera_packet.matrix = matrix;
	camera_packet_timestamp.get = performance.now();
});

const PGroup = new THREE.Group();
window.IPC.on('SET_PATH', (path) => {
	if(PGroup.children.length > 0) {
		scene.remove(PGroup);
		PGroup.children = [];
	}

	var lPoint = false;
	for(const point of path) {
		const pos = toXZY(point.pos);

		if(lPoint) {
			const vertices = [
				lPoint.x, lPoint.y, lPoint.z,
				pos.x, pos.y, pos.z
			];

			const pGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
			const pMaterial = new THREE.LineBasicMaterial({ 
				color: 0x00ff00, 
				transparent: true, 
				opacity: (-1 / 200 * camera.position.distanceTo(pos)) + 0.75,
			});

			const pMesh = new THREE.Line(pGeometry, pMaterial);
			pMesh.userData.speed = point.speed;
			PGroup.add(pMesh);
		}

		lPoint = pos;
	}
	
	scene.add(PGroup);
});

// GHOST POINT 
const PointGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1, 1, 1, 1);
const PointMaterial = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffff00 });
const PointGeometryWheel = new THREE.BoxGeometry(0.15, 0.35, 0.35, 1, 1, 1);
const PointMaterialWheel = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });

const GhostObject = new THREE.Mesh(PointGeometry, PointMaterial); 
scene.add(GhostObject);

const GhostWheelsGroup = new THREE.Group();
GhostWheelsGroup.add(new THREE.Mesh(PointGeometryWheel, PointMaterialWheel)); 
GhostWheelsGroup.add(new THREE.Mesh(PointGeometryWheel, PointMaterialWheel)); 
GhostWheelsGroup.add(new THREE.Mesh(PointGeometryWheel, PointMaterialWheel)); 
GhostWheelsGroup.add(new THREE.Mesh(PointGeometryWheel, PointMaterialWheel)); 
scene.add(GhostWheelsGroup);

window.IPC.on('DRAW_GHOST', (pos, heading, wheels) => {
	pos = toXZY(pos);

	// ghost
	GhostObject.position.set(pos.x, pos.y, pos.z);
	GhostObject.rotation.set(0, heading, 0);

	// get closest to ghost
	const closest = { obj: false, dist: 0 };
	for(const obj of PGroup.children) {
		const vertex = new THREE.Vector3().fromBufferAttribute(obj.geometry.getAttribute('position'), 1);
		const dist = vertex.distanceTo(pos);

		if(closest.obj === false || dist < closest.dist) {
			closest.obj = obj;
			closest.dist = dist;
		}
	}

	if(closest.obj) {
		const idx = PGroup.children.indexOf(closest.obj);
		const idxMin = Math.max(0, idx-50);
		const idxMax = Math.min(idx+50, PGroup.children.length-1);

		const speedCenter = PGroup.children[idx].userData.speed;

		for(const obj of PGroup.children.slice(idxMin, idxMax)) {
			obj.material.color.setHex(speedToHexColor(obj.userData.speed, speedCenter));
		}
	}

	// wheels
	for(const wheelPos of wheels) {
		const idx = wheels.indexOf(wheelPos);
		const wpos = toXZY(wheelPos);
		const obj = GhostWheelsGroup.children[idx];
		if(!obj) continue;

		obj.position.set(wpos.x, wpos.y, wpos.z);
		obj.rotation.set(0, heading, 0);
	}
});



const Group = new THREE.Group();
window.IPC.on('DEBUG_DRAW', (items) => {
	if(Group.children.length > 0) {
		scene.remove(Group);
		Group.children = [];
	}

	for(const item of items) {
		if(item.type == 'point') {
			const materialToUse = item.color !== undefined ? new THREE.MeshBasicMaterial({ wireframe: false, color: item.color }) : PointMaterial;

			const point = new THREE.Mesh(item.wheel ? PointGeometryWheel : PointGeometry, materialToUse); 
			point.position.set(item.pos.x, item.pos.z, -item.pos.y);
			if(item.heading !== undefined) {
				point.rotation.set(0, item.heading, 0);
			}
			
			Group.add(point);
		}

		if(item.type == 'path') {
			var lPoint = false;
			for(const pItem of item.path) {
				const pos = toXZY(pItem.pos);

				if(lPoint) {
					const vertices = [
						lPoint.x, lPoint.y, lPoint.z,
						pos.x, pos.y, pos.z
					];

					const pGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
					const pMaterial = new THREE.LineBasicMaterial({ 
						color: pItem.color, 
						transparent: true, 
						opacity: (-1 / 400 * camera.position.distanceTo(pos)) + 0.75,
					});

					const pMesh = new THREE.Line(pGeometry, pMaterial);
					Group.add(pMesh);
				}

				lPoint = pos;
			}
		}
	}
	
	scene.add(Group);
});