import * as THREE from 'three';
import Stats from './stats_module.js'

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

// frame
const animate = () => {
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

const PointGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1, 1, 1, 1);
const PointGeometryWheel = new THREE.BoxGeometry(0.15, 0.35, 0.35, 1, 1, 1);
const PointMaterial = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffff00 });

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
			for(const pPos of item.path) {
				const pos = toXZY(pPos);

				if(lPoint) {
					const vertices = [
						lPoint.x, lPoint.y, lPoint.z,
						pos.x, pos.y, pos.z
					];

					const pGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
					const pMaterial = new THREE.LineBasicMaterial({ 
						color: 0xffff00, 
						transparent: true, 
						opacity: (-1 / 600 * camera.position.distanceTo(pos)) + 0.75,
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