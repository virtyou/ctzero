zero.base.clothes = {
	aura: {},
	pelvis: {},
	lumbar: {},
	ribs: {},
	neck: {
		necklace: {
			torusGeometry: true,
			rotation: [2, 0, 0],
			scale: [0.05, 0.05, 0.05]
		}
	},
	clavicle: {},
	shoulder: {
		pad: {
			sphereGeometry: true,
			scale: [4, 4, 4]
		},
		spike: {
			coneGeometry: true,
			position: [0, 6, 0],
			scale: [0.1, 0.3, 0.1]
		},
		spikes: {
			sphereGeometry: true,
			scale: [4, 4, 4],
			parts: [{
				coneGeometry: true,
				position: [0, 1, 0],
				scale: [0.02, 0.06, 0.02]
			}, {
				coneGeometry: true,
				position: [0, 0.5, 1],
				rotation: [1, 0, 0],
				scale: [0.02, 0.06, 0.02]
			}, {
				coneGeometry: true,
				position: [0, 0.5, -1],
				rotation: [-1, 0, 0],
				scale: [0.02, 0.06, 0.02]
			}]
		}
	},
	elbow: {},
	wrist: {
		bracelet: {
			torusGeometry: true,
			rotation: [-2, 0, 0],
			scale: [0.02, 0.02, 0.02]
		}
	},
	finger: {
		ring: {
			torusGeometry: true,
			rotation: [-2, 0, 0],
			scale: [0.008, 0.008, 0.008]
		}
	},
	hip: {},
	knee: {},
	ankle: {
		anklet: {
			torusGeometry: true,
			rotation: [1, 0, 0],
			scale: [0.05, 0.05, 0.05]
		}
	},
	toe: {}
};

zero.base.clothes.head = { // hats
	conical: {
		coneGeometry: true,
		position: [0, 20, 0],
		scale: [0.5, 0.5, 0.5]
	},
	donut: {
		torusGeometry: true,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		scale: [0.1, 0.1, 0.1]
	},
	square: {
		octahedronGeometry: true,
		position: [0, 15, 0],
		scale: [15, 15, 15]
	},
	stovepipe: {
		circleGeometry: true,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		scale: [0.4, 0.4, 0.4],
		parts: [{
			name: "pipe",
			cylinderGeometry: true,
			scale: [2, 2, 2],
			rotation: [-2, 0, 0],
			position: [0, 0, -20]
		}]
	},
	tricorn: {
		circleGeometry: true,
		circleSegs: 3,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		scale: [0.6, 0.6, 0.6],
		parts: [{
			name: "pipe",
			sphereSegs: 6,
			sphereGeometry: 10,
			scale: [2, 2, 2],
			position: [0, 0, -10]
		}]
	},
	beret: {
		sphereSegs: 3,
		sphereGeometry: 10,
		rotation: [0, 0, 2],
		position: [0, 15, 0]
	}
};

zero.base.clothes.procedurals = function(kind) {
	if (!kind.startsWith("worn_"))
		return [];
	var bpart = kind.slice(5),
		gz = zero.base.clothes[bpart],
		tmod = "zero.base.clothes." + bpart + ".";
	return Object.keys(gz).map(function(g) {
		return {
			name: g,
			kind: kind,
			thing: "Garment",
			template: tmod + g
		};
	});
};

/*
box, sphere, torusKnot, cone, cylinder, plane
Garment
 - flowy > Hair X Flower???
   - Fabric/Cloth > Flap, Strip
   - skirt, cape, cloak, shawl, hood
 - procedural
   - hat
     - conical [w/ veil/tassel]
     - donut!
     - crowns!!
     - beret
     - fedora
     - tophat [honest abe]
     - tri[etc]-corner hats
*/