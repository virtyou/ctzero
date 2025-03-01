var P2 = Math.PI / 2, P4 = P2 / 2, C4 = ["curve4", 3, 0.5, 3];

zero.base.items = {
	bouquet: {
		variety: "quest",
		parts: [{
			thing: "Flora",
			kind: "flower",
			basicBound: false,
			rotation: [0.2, 0, 0]
		}, {
			thing: "Flora",
			kind: "flower",
			basicBound: false,
			rotation: [-0.2, 0, 0]
		}, {
			thing: "Flora",
			kind: "flower",
			basicBound: false,
			rotation: [0, 0, 0.2]
		}, {
			thing: "Flora",
			kind: "flower",
			basicBound: false,
			rotation: [0, 0, -0.2]
		}]
	},
	kingsfoil: {
		variety: "quest",
		parts: [{
			thing: "Flora",
			kind: "flower",
			basicBound: false
		}]
	},
	"dragon's tail": {
		variety: "quest",
		parts: [CT.merge({
			thing: "Tail",
			material: {
				color: "#111111"
			}
		}, zero.base.body.tail.lizard)]
	},
	key: {
		variety: "key",
		cylinderGeometry: 0.5,
		geomult: 20,
		parts: [{
			cylinderGeometry: 0.25,
			geomult: 6,
			position: [0, 4, 1],
			rotation: [P2, 0, 0]
		}, {
			cylinderGeometry: 0.25,
			geomult: 8,
			position: [0, 3, 1],
			rotation: [P2, 0, 0]
		}, {
			cylinderGeometry: 0.25,
			geomult: 6,
			position: [0, 2, 1],
			rotation: [P2, 0, 0]
		}, {
			cylinderGeometry: 0.2,
			geomult: 10,
			position: [0, -5, 0],
			rotation: [P2, 0, 0]
		}, {
			torusGeometry: true,
			torusTubeRadius: 4,
			position: [0, -5, 0],
			rotation: [0, P2, 0]
		}]
	},
	candle: {
		variety: "flamer",
		cylinderGeometry: true,
		wicker: true,
		geomult: 10,
//		rotation: [P2, 0, 0],
		position: [0, -1, 2],
		material: {
			color: "#ffffff"
		},
		parts: [{
			thing: "Fire",
			name: "fire",
			regTick: true,
			faceUp: true,
			quenched: true,
			burnRate: 20,
			lightIntensity: 0.4,
			position: [0, 5, 0],
			scale: [0.1, 0.1, 0.1]
		}, {
			name: "wick",
			cylinderGeometry: 0.1,
			geomult: 10,
			position: [0, 5, 0],
			material: {
				color: "#000000"
			}
		}]
	},
	lighter: {
		variety: "flamer",
		cylinderGeometry: 0.5,
		clicker: true,
		geomult: 10,
		rotation: [P2, 0, 0],
		position: [0, -1, 2],
		material: {
			color: "#000000"
		},
		parts: [{
			thing: "Fire",
			name: "fire",
			regTick: true,
			faceUp: true,
			quenched: true,
			loudIgnite: true,
			burnRate: 30,
			lightIntensity: 0.2,
			position: [0, 3, 0],
			scale: [0.08, 0.08, 0.08]
		}, {
			name: "handle",
			boxGeometry: [0.8, 3, 1],
			position: [0, -3, 0.1],
			material: {
				color: "#ff0000"
			}
		}, {
			name: "guard",
			torusGeometry: 0.5,
			torusTubeRadius: 0.1,
			position: [0, -1.3, 0.5],
			rotation: [0, P2, 0],
			material: {
				color: "#ff0000"
			}
		}, {
			name: "trig",
			boxGeometry: [0.2, 1.5, 0.05],
			position: [0, -1.5, 0],
			rotation: [Math.PI * 3 / 8, 0, 0],
			material: {
				color: "#000000"
			}
		}]
	},
	torch: {
		variety: "flamer",
		cylinderGeometry: true,
		geomult: 60,
		rotation: [P2, 0, 0],
		position: [0, -8, 25],
		material: {
			color: "#4a3728"
		},
		parts: [{
			thing: "Fire",
			name: "fire",
			regTick: true,
			faceUp: true,
			quenched: true,
			position: [0, 30, 0],
			scale: [0.5, 0.5, 0.5]
		}, {
			name: "head",
			cylinderGeometry: 3,
			position: [0, 30, 0],
			material: {
				color: "#36454f"
			}
		}]
	},
	mallet: {
		variety: "smasher",
		cylinderGeometry: 2,
		geomult: 30,
		rotation: [P2, 0, 0],
		position: [0, -8, 25],
		material: {
			color: "#4a3728"
		},
		parts: [{
			name: "head",
			cylinderGeometry: 10,
			position: [0, 30, 0],
			rotation: [P2, 0, 0],
			material: {
				color: "#00ff00"
			}
		}]
	},
	"lacrosse stick": {
		variety: "grabber",
		cylinderGeometry: true,
		geomult: 60,
		rotation: [P2, 0, 0],
		position: [0, -8, 25],
		material: {
			color: "#0000ff"
		},
		parts: [{
			name: "perch",
			position: [0, 30, 0],
			parts: [{
				tubeGeometry: C4,
				rotation: [0, -P2, 0]
			}, {
				tubeGeometry: C4,
				rotation: [0, -P4, 0]
			}, {
				tubeGeometry: C4,
				rotation: [0, 0, 0]
			}, {
				tubeGeometry: C4,
				rotation: [0, P4, 0]
			}, {
				tubeGeometry: C4,
				rotation: [0, P2, 0]
			}]
		}]
	}
};