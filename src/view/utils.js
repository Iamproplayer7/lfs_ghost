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