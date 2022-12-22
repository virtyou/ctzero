zero.base.clothes = {
	pelvis: {},
	lumbar: {},
	ribs: {},
	neck: {
		necklace: {
			torusGeometry: true,
			rotation: [2, 0, 0],
			scale: [0.05, 0.05, 0.05]
		},
		cape: {
			parts: [{
				thing: "Cloth",
				name: "cape",
				height: 40,
				width: 18
			}]
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
			scale: [2, 2, 2]
		},
		strip: {
			torusGeometry: 3,
			rotation: [-2, 0, 0],
			parts: [{
				thing: "Cloth",
				name: "ribbon",
				height: 24,
				width: 8
			}]
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
	toe: {},
	aura: {
		dry: {
			scale: [3, 3, 3],
			parts: [{
				name: "smoke",
				kind: "aura",
				thing: "Particles"
			}]
		},
		cold: {
			scale: [80, 80, 80],
			parts: [{
				name: "bubble",
				kind: "aura",
				thing: "Bit",
				sphereSegs: 4,
				material: {
					opacity: 0.6,
					transparent: true
				}
			}]
		},
		wet: {
			scale: [80, 80, 80],
			parts: [{
				name: "water",
				kind: "aura",
				thing: "Bit",
				vstrip: "templates.one.vstrip.water"
			}]
		},
		hot: {
			scale: [80, 80, 80],
			parts: [{
				name: "sparks",
				kind: "aura",
				thing: "Bit",
				vstrip: "templates.one.vstrip.sparks"
			}]
		}
	}
};

zero.base.clothes.head = { // hats
	conical: {
		coneGeometry: true,
		position: [0, 20, 0],
		scale: [0.5, 0.5, 0.5],
		parts: [{
			thing: "Cloth",
			name: "tassel",
			height: 24,
			width: 8
		}]
	},
	donut: {
		torusGeometry: true,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		scale: [0.1, 0.1, 0.1]
	},
	crown: {
		parts: [{
			name: "rim",
			torusGeometry: true,
			rotation: [-1.8, 0, 0],
			position: [0, 10, 0],
			scale: [0.08, 0.08, 0.08],
		}, {
			name: "spike1",
			kind: "spike",
			coneGeometry: true,
			position: [0, 20, 8],
			scale: [0.1, 0.5, 0.1]
		}, {
			name: "spike2",
			kind: "spike",
			coneGeometry: true,
			position: [0, 20, -8],
			scale: [0.1, 0.5, 0.1]
		}, {
			name: "spike3",
			kind: "spike",
			coneGeometry: true,
			position: [8, 20, 0],
			scale: [0.1, 0.5, 0.1]
		}, {
			name: "spike4",
			kind: "spike",
			coneGeometry: true,
			position: [-8, 20, 0],
			scale: [0.1, 0.5, 0.1]
		}]
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