var P2 = Math.PI / 2, P4 = P2 / 2, C4 = ["curve4", 3, 0.5, 3];

zero.base.items = {
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