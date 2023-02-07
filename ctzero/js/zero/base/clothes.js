zero.base.clothes = {
	pelvis: {},
	lumbar: {},
	ribs: {
		apron: {
			boxGeometry: true,
			scale: [10, 30, 10],
			position: [0, 0, 2.5],
			material: {
				transparent: true,
				opacity: 0
			},
			parts: [{
				thing: "Cloth",
				name: "cloth",
				height: 16,
				width: 20,
				displacement: { x: 0, y: -10, z: 6 }
			}]
		}
	},
	neck: {
		necklace: {
			torusGeometry: true,
			rotation: [2, 0, 0],
			scale: [4, 4, 4]
		},
		cape: {
			boxGeometry: true,
			scale: [20, 80, 18],
			position: [0, 0, 4],
			material: {
				transparent: true,
				opacity: 0,
				color: "#ff0000"
			},
			parts: [{
				thing: "Cloth",
				name: "cape",
				height: 40,
				width: 20,
				displacement: { x: 0, y: -40, z: -10 }
			}]
		},
		cloak: {
			boxGeometry: true,
			scale: [20, 40, 18],
			position: [0, -20, 0],
			material: {
				transparent: true,
				opacity: 0,
				color: "#ff0000"
			},
			parts: [{
				thing: "Cloth",
				name: "cloak",
				height: 100,
				width: 100,
				segLen: 5,
				flatDim: "y",
				anchorPoints: "none",
				displacement: { x: 0, y: 20, z: 0 },
				tweaks: {
					kDF: 1
				}
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
			scale: [2, 6, 2]
		},
		spikes: {
			sphereGeometry: true,
			scale: [4, 4, 4],
			parts: [{
				coneGeometry: true,
				position: [0, 1, 0],
				scale: [0.1, 1.2, 0.1]
			}, {
				coneGeometry: true,
				position: [0, 0.5, 1],
				rotation: [1, 0, 0],
				scale: [0.1, 1.2, 0.1]
			}, {
				coneGeometry: true,
				position: [0, 0.5, -1],
				rotation: [-1, 0, 0],
				scale: [0.1, 1.2, 0.1]
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
			scale: [0.5, 0.5, 0.5]
		}
	},
	hip: {},
	knee: {},
	ankle: {
		anklet: {
			torusGeometry: true,
			rotation: [1, 0, 0],
			scale: [3, 3, 3]
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
		position: [0, 30, 0],
		scale: [10, 20, 10],
		parts: [{
			thing: "Cloth",
			name: "tassel",
			height: 24,
			width: 4,
			displacement: { x: 0, y: 0, z: 0 }
		}]
	},
	donut: {
		torusGeometry: true,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		scale: [10, 10, 10],
		rigids: ["sphere"],
		parts: [{
			name: "sphere",
			sphereGeometry: 8,
			position: [0, 0, 0.8],
			scale: [0.1, 0.1, 0.1],
			material: {
				transparent: true,
				opacity: 0
			}
		}, {
			thing: "Cloth",
			name: "veil",
			height: 16,
			width: 16,
			displacement: { x: 0, y: -10, z: 10 },
			material: {
				transparent: true,
				opacity: 0.5
			}
		}]
	},
	crown: {
		parts: [{
			name: "rim",
			torusGeometry: true,
			rotation: [-1.8, 0, 0],
			position: [0, 10, 0],
			scale: [8, 8, 8]
		}, {
			name: "spike1",
			kind: "spike",
			coneGeometry: true,
			position: [0, 20, 8],
			scale: [2, 10, 2]
		}, {
			name: "spike2",
			kind: "spike",
			coneGeometry: true,
			position: [0, 20, -8],
			scale: [2, 10, 2]
		}, {
			name: "spike3",
			kind: "spike",
			coneGeometry: true,
			position: [8, 20, 0],
			scale: [2, 10, 2]
		}, {
			name: "spike4",
			kind: "spike",
			coneGeometry: true,
			position: [-8, 20, 0],
			scale: [2, 10, 2]
		}]
	},
	octahedron: {
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