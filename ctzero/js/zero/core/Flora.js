zero.core.Flora = CT.Class({
	CLASSNAME: "zero.core.Flora",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.stems; i++) {
			pz.push({
				subclass: zero.core.Flora.Stem,
				index: i,
				name: "stem" + i,
				kind: "stem",
				levels: oz.levels,
				plant: this,
				position: [0, -20, 0]
			});
		}
		(oz.kind in zero.core.Fauna.sets) && pz.push({
			within: this,
			regTick: true,
			name: "critters",
			kind: "menagerie",
			collection: oz.kind,
			scale: oz.scale.map(s => 1 / s),
			subclass: zero.core.Fauna.Menagerie
		});
	},
	buildMaterials: function() {
		var oz = this.opts, mats = this.materials = {};
		if (oz.leaves)
			mats.leaf = zero.core.util.randMat(oz.leaf);
		["stem", "fruit", "flower", "petal"].forEach(function(part) {
			if (oz[part + "s"])
				mats[part] = zero.core.util.randMat(oz[part]);
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.base.flora[opts.kind], {
			basicBound: true,
			stem: "brown",
			leaf: "green",
			fruit: "red",
			flower: "blue",
			petal: "yellow",
			stems: 1,
			levels: 2, // depth (branch layers)
			segments: 2, // per stem/branch
			branches: 2, // per segment
			flowers: 1, // max per (outer) segment
			petals: 8, // max per flower
			fruits: 1, // max per (outer) segment
			leaves: 3 // max per segment
		}, this.opts);
		this.buildMaterials();
	}
}, zero.core.Thing);

zero.core.Flora.Stem = CT.Class({
	CLASSNAME: "zero.core.Flora.Stem",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, ploz = oz.plant.opts,
			soz, s = 1, i, lev = oz.levels - 1, r = Math.random;
		for (i = 0; i < ploz.segments; i++) {
			s -= 0.1;
			soz = {
				subclass: zero.core.Flora.Segment,
				index: i,
				name: "segment" + i,
				kind: "segment",
				levels: lev,
				plant: oz.plant,
				scale: [s, s, s],
				position: [0, 10, 0],
				rotation: [r() - 0.5, r() - 0.5, r() - 0.5]
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
	}
}, zero.core.Thing);

zero.core.Flora.Branch = CT.Class({
	CLASSNAME: "zero.core.Flora.Branch"
}, zero.core.Flora.Stem);

zero.core.Flora.Segment = CT.Class({
	CLASSNAME: "zero.core.Flora.Segment",
	enders: function(variety) {
		var oz = this.opts, pz = oz.parts,
			i, ploz = oz.plant.opts,
			endz = zero.core.Flora.enders,
			sing = endz.sings[variety],
			subclass = endz.subclasses[sing];
		for (i = 0; i < CT.data.random(ploz[variety] + 1); i ++) {
			pz.push({
				subclass: subclass,
				index: i,
				name: sing + i,
				kind: sing,
				plant: oz.plant,
				position: [CT.data.random(10) - 5,
					5, CT.data.random(10) - 5]
			});
		}
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts,
			ploz = oz.plant.opts, r = Math.random;
		if (oz.levels) {
			for (i = 0; i < ploz.branches; i++) {
				pz.push({
					subclass: zero.core.Flora.Branch,
					index: i,
					name: "branch" + i,
					kind: "branch",
					plant: oz.plant,
					scale: [0.8, 0.8, 0.8],
//					rotation: [0, Math.random * 2 * Math.PI, 1 + Math.random()],
					rotation: [r() - 0.5, r() - 0.5, r() - 0.5]
				});
			}
		} else if (oz.index)
			["leaves", "fruits", "flowers"].forEach(this.enders);
		else
			this.enders("leaves");
	},
	init: function(opts) {
		var basics = {
			matinstance: opts.plant.materials.stem,
			cylinderGeometry: 1,
			geomult: 10
		};
		if (opts.plant.opts.kind == "tree") {
			basics.cylinderGeometry = 4;
			basics.geomult = 2.5;
		}
		this.opts = CT.merge(opts, basics, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Leaf = CT.Class({
	CLASSNAME: "zero.core.Flora.Leaf",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: 8,
			rotation: [0, CT.data.random(Math.PI, true), 2],
			scale: [0.3, 1, 1],
			matinstance: opts.plant.materials.leaf
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Fruit = CT.Class({
	CLASSNAME: "zero.core.Flora.Fruit",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			sphereGeometry: 4,
//			rotation: [0, CT.data.random(Math.PI, true), 1],
			matinstance: opts.plant.materials.fruit
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Flower = CT.Class({
	CLASSNAME: "zero.core.Flora.Flower",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts,
			ploz = oz.plant.opts, seg = Math.PI * 2 / ploz.petals;
		for (i = 0; i < ploz.petals; i++) {
			pz.push({
				subclass: zero.core.Flora.Petal,
				index: i,
				name: "petal" + i,
				kind: "petal",
				plant: oz.plant,
				rotation: [0, i * seg, 1 + Math.random()]
			});
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			sphereGeometry: 2,
			matinstance: opts.plant.materials.flower
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Petal = CT.Class({
	CLASSNAME: "zero.core.Flora.Petal",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: 3,
			scale: [0.2, 1, 1],
			matinstance: opts.plant.materials.petal
		}, this.opts);
	}
}, zero.core.Thing);

var F = zero.core.Flora;
F.enders = {
	subclasses: {
		leaf: F.Leaf,
		fruit: F.Fruit,
		flower: F.Flower
	},
	sings: {
		leaves: "leaf",
		fruits: "fruit",
		flowers: "flower"
	}
};

zero.core.Flora.sets = {
	patch: {
		flower: 10,
		bush: 3
	},
	forest: {
		tree: 4,
		bush: 3,
		flower: 2
	}
};
zero.core.Flora.setter = "garden";
zero.core.Flora.Garden = CT.Class({
	CLASSNAME: "zero.core.Flora.Garden",
	kinds: ["tree", "bush", "flower"],
	counts: {
		flower: 10,
		bush: 4,
		tree: 2
	},
	sets: zero.core.Flora.sets,
	member: "Flora",
	removables: false,
	onremove: function() {
		for (var part of this.parts)
			part.critters && part.critters.remove();
	}
}, zero.core.Collection);