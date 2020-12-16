zero.base.particles = {
	bubbles: {
		velocity: [0, 25, 0],
		variance: [1, 0, 1],
		pmat: {
			opacity: 0.6,
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
		size: 0.01,
		sizeVariance: 0.04,
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
		velocity: [0, 8, 0],
		velVariance: [4, 0, 4],
		dissolve: 0.1,
		grow: 0.05,
		drip: true,
		pmat: {
			opacity: 0,
			color: 0x888888,
			transparent: true
		}
	},
	fog: {
		count: 8,
		drip: true,
		grow: 0.02,
		dissolve: 0.02,
		sizeVariance: 0.8,
		velocity: [0, 0.5, 0],
		velVariance: [4, 2, 4],
		scale: [40, 4, 80],
		pmat: {
			opacity: 0,
			color: 0x999999,
			transparent: true,
			side: THREE.DoubleSide
		}
	},
	aura: {

	}
};