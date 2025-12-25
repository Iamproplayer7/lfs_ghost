function rowToColumnMajor(matrix) {
	const result = new Array(9);
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			result[col * 3 + row] = matrix[row * 3 + col];
		}
	}
	return result;
}

const toRad = (deg) => {
	return deg * (Math.PI / 180);
}

const toDeg = (rad) => {
	return rad * (180 / Math.PI);
}

const clamp = (v, min, max) => {
    return Math.min(Math.max(v, min), max);
}

const speedToHexColor = (speed, centerSpeed, range = 5) => {
	let t = (speed - centerSpeed) / range;
	t = clamp(t, -1, 1);

	let r, g;

	if (t < 0) {
		r = 255;
		g = Math.round(255 * (1 + t));
	} else {
		r = Math.round(255 * (1 - t));
		g = 255;
	}

	return (r << 16) | (g << 8);
}