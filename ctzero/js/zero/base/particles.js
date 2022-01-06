zero.base.particles = {
	bubbles: {
		velocity: [0, 25, 0],
		variance: [1, 0, 1],
		pmat: {
			opacity: 0.3,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	bubbletrail: {
		count: 30,
		velocity: [0, -400, 0],
		velVariance: [25, 25, 25],
		variance: [1, 1, 1],
		dissolve: 0.5,
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	sparks: {
		count: 20,
		size: 1,
		sizeVariance: 2,
		velocity: [0, 24, 0],
		acceleration: [0, -24, 0],
		velVariance: [40, 0, 40],
		dissolve: 0.25,
		drip: true,
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0xff2222,
			transparent: true
		}
	},
	smoke: {
		count: 4,
		sizeVariance: 10,
		velocity: [0, 8, 0],
		velVariance: [4, 0, 4],
		dissolve: 0.1,
		grow: 0.05,
		drip: true,
		pmat: {
			opacity: 0,
			color: 0x888888,
			transparent: true,
			side: THREE.BackSide
		}
	},
	fog: {
		count: 6,
//		drip: true,
//		grow: 0.02,
//		dissolve: 0.02,
		sizeVariance: 0.8,
//		posVariance: [200, 20, 200],
		velVariance: [1, 0.5, 1],
		scale: [200, 20, 400],
		pmat: {
			opacity: 1,
			color: 0x999999,
			transparent: true,
			side: THREE.DoubleSide
		}
	},
	rain: {
		count: 800,
		size: 2,
		velocity: [0, -300, 0],
		scale: [1, 4, 1],
		sharemat: true,
		pmat: {
			opacity: 0.6,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	aura: {

	}
};