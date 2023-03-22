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
		bowtie: {
			torusGeometry: true,
			rotation: [2, 0, 0],
			position: [0, 2, 2],
			scale: [3.5, 3.5, 3.5],
			parts: [{
				name: "left",
				coneGeometry: true,
				scale: [0.5, 1, 1],
				position: [0, 1, 0],
				rotation: [0, 0, Math.PI / 2]
			}, {
				name: "right",
				coneGeometry: true,
				scale: [0.5, 1, 1],
				position: [0, 1, 0],
				rotation: [0, 0, -Math.PI / 2]
			}]
		},
		necktie: {
			boxGeometry: true,
			scale: [15, 30, 10],
			position: [0, -18, 5],
			material: {
				transparent: true,
				opacity: 0,
				color: "#ff0000"
			},
			parts: [{
				name: "ring",
				torusGeometry: true,
				rotation: [1.8, 0, 0],
				scale: [0.25, 0.3, 0.25],
				position: [0, 0.6, -0.25]
			}, {
				thing: "Cloth",
				name: "tie",
				height: 28,
				width: 4,
				displacement: { x: 0, y: -12, z: 3 }
			}]
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
			position: [0, -15, 0],
			material: {
				transparent: true,
				opacity: 0,
				color: "#ff0000"
			},
			rigids: ["weight"],
			parts: [{
				name: "weight",
				friction: 1000,
				sphereGeometry: 0.25,
				position: [0, 0.6, 0],
//				boxGeometry: [1, 0.25, 1],
//				position: [0, 0.63, 0],
				material: {
					transparent: true,
					opacity: 0,
					color: "#ff0000"
				}
			}, {
				thing: "Cloth",
				name: "cloak",
				height: 120,
				width: 120,
				segLen: 8,
				flatDim: "y",
				anchorFriction: 2,
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
	glasses: {
		parts: [{
			name: "left",
			circleGeometry: true,
			position: [-3, 5, 10],
			scale: [2, 2, 2],
			material: {
				transparent: true,
				shininess: 100,
				opacity: 0.5
			}
		}, {
			name: "right",
			circleGeometry: true,
			position: [3, 5, 10],
			scale: [2, 2, 2],
			material: {
				transparent: true,
				shininess: 100,
				opacity: 0.5
			}
		}, {
			name: "lear",
			boxGeometry: true,
			position: [-6, 6, 5],
			scale: [0.2, 0.2, 10]
		}, {
			name: "rear",
			boxGeometry: true,
			position: [6, 6, 5],
			scale: [0.2, 0.2, 10]
		}, {
			name: "front",
			boxGeometry: true,
			position: [0, 6, 10],
			scale: [12, 0.2, 0.2]
		}]
	},
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
	veil: {
		rigids: ["ball"],
		parts: [{
			name: "ball",
			sphereGeometry: 8,
			position: [0, 8.3, 2.3]
		}, {
			name: "backhold",
			boxGeometry: true,
			scale: [10, 1, 1],
			position: [0, 10, -12],
			material: {
				transparent: true,
				opacity: 0
			}
		}, {
			name: "back",
			thing: "Cloth",
			flatDim: "y",
//			segLen: 8,
			width: 48,
			height: 40,
			frame: "backhold",
			anchorPoints: "thirts",
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
		circleGeometry: 15,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		parts: [{
			name: "pipe",
			cylinderGeometry: 7,
			rotation: [-2, 0, 0],
			position: [0, 0, -5]
		}]
	},
	tricorn: {
		circleGeometry: 20,
		circleSegs: 3,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		parts: [{
			name: "pipe",
			sphereSegs: 6,
			sphereGeometry: 10,
			position: [0, 0, -5]
		}]
	},
	beret: {
		sphereSegs: 3,
		sphereGeometry: 10,
		rotation: [0, 0, 2],
		position: [0, 15, 0]
	},
	don: {
		circleGeometry: 15,
		rotation: [1, 0, 0],
		position: [0, 10, 0],
		material: {
			side: THREE.DoubleSide
		},
		parts: [{
			name: "dome",
			sphereGeometry: 7,
			position: [0, 1, 0]
		}]
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