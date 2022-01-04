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
				plant: this
			});
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.base.flora[opts.name], {
			stem: "brown",
			leaf: "green",
			fruit: "red",
			flower: "blue",
			petal: "yellow",
			stems: 1,
			levels: 1, // depth (branch layers)
			segments: 2, // per stem/branch
			branches: 2, // per segment
			flowers: 1, // max per (outer) segment
			fruits: 1, // max per (outer) segment
			leaves: 3 // max per (outer) segment
		}, this.opts);
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
				position: [0, 0, 20],
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
			subclass = endz.subclasses[variety],
			sing = endz.sings[variety];
		for (i = 0; i < CT.data.random(ploz[variety] + 1); i ++) {
			pz.push({
				subclass: subclass,
				index: i,
				name: sing + i,
				kind: sing,
				plant: oz.plant
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
					rotation: [r() - 0.5, r() - 0.5, r() - 0.5]
				});
			}
		} else
			["leaves", "fruits", "flowers"].forEach(this.enders);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.plant.opts.stem)
			}
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Leaf = CT.Class({
	CLASSNAME: "zero.core.Flora.Leaf",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.plant.opts.leaf)
			}
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Fruit = CT.Class({
	CLASSNAME: "zero.core.Flora.Fruit",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			sphereGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.plant.opts.fruit)
			}
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Flower = CT.Class({
	CLASSNAME: "zero.core.Flora.Flower",
	init: function(opts) {
		// TODO: add petals!
		this.opts = CT.merge(opts, {
			sphereGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.plant.opts.flower)
			}
		}, this.opts);
	}
}, zero.core.Thing);

var F = zero.core.Flora;
F.enders = {
	subclasses: {
		leaves: F.Leaf,
		fruits: F.Fruit,
		flowers: F.Flower
	},
	sings: {
		leaves: "leaf",
		fruits: "fruit",
		flowers: "flower"
	}
};