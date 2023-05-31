zero.base.particles = {
	bubbles: {
		velocity: [0, 25, 0],
		variance: [1, 0, 1],
		pmat: {
			opacity: 0.3,
			alphaTest: 0.3,
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
			alphaTest: 0.1,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	splash: {
		count: 40,
		size: 1,
		sizeVariance: 2,
		velocity: [0, 200, 0],
		acceleration: [0, -500, 0],
		velVariance: [100, 0, 100],
		floorbound: true,
		sharemat: true,
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	nuts: {
		count: 10,
		size: 3,
		sizeVariance: 2,
		velocity: [0, 200, 0],
		acceleration: [0, -500, 0],
		velVariance: [100, 0, 100],
		floorbound: true,
		refloor: true,
		sharemat: true,
		bitshape: {
			torusGeometry: true,
			spin: true
		},
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0x545761,
			transparent: true
		}
	},
	bolts: {
		count: 6,
		size: 1,
		sizeVariance: 2,
		velocity: [0, 200, 0],
		acceleration: [0, -500, 0],
		velVariance: [100, 0, 100],
		floorbound: true,
		refloor: true,
		sharemat: true,
		bitshape: {
			cylinderGeometry: true,
			geomult: 5,
			spin: true,
			parts: [{
				torusGeometry: 1,
				torusTubeRadius: 1,
				position: [0, 2, 0],
				rotation: [Math.PI / 2, 0, 0]
			}]
		},
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0x457516,
			transparent: true
		}
	},
	sparks: {
		count: 20,
		size: 0.5,
		sizeVariance: 2,
		velocity: [0, 40, 0],
		acceleration: [0, -40, 0],
		velVariance: [80, 0, 80],
		dissolve: 0.25,
		drip: true,
		pmat: {
			opacity: 0,
			alphaTest: 0.1,
			shininess: 150,
			color: 0xff2222,
			transparent: true
		}
	},
	dust: {
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
			alphaTest: 0.1,
			shininess: 150,
			color: 0xffffff,
			transparent: true
		}
	},
	smoke: {
		count: 4,
		size: 10,
		sizeVariance: 10,
		velocity: [0, 8, 0],
		velVariance: [4, 0, 4],
		dissolve: 0.1,
		grow: 0.05,
		drip: true,
		pmat: {
			opacity: 0,
			alphaTest: 0.1,
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
		count: 200,
		size: 2,
		velocity: [0, -300, 0],
		scale: [1, 4, 1],
		topobound: true,
		sharemat: true,
		pmat: {
			opacity: 0.6,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	}
};