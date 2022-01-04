zero.core.Flora = CT.Class({
	CLASSNAME: "zero.core.Flora",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.stems; i++) {
			pz.push(CT.merge({
				subclass: zero.core.Flora.Stem,
				index: i,
				name: "stem" + i,
				kind: "stem"
			}, oz));
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
			levels: 2, // depth (branch layers)
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
		var oz = this.opts, pz = oz.parts, s = 1,
			i, lev = oz.level - 1, r = Math.random;
		for (i = 0; i < oz.segments; i++) {
			s -= 0.1;
			pz.push(CT.merge({
				subclass: zero.core.Flora.Segment,
				index: i,
				name: "segment" + i,
				kind: "segment",
				level: lev,
				scale: [s, s, s],
				position: [0, 0, 20 * i],
				rotation: [r() - 0.5, r() - 0.5, r() - 0.5]
			}, oz));
		}
	}
}, zero.core.Thing);

zero.core.Flora.Branch = CT.Class({
	CLASSNAME: "zero.core.Flora.Branch"
}, zero.core.Flora.Stem);

zero.core.Flora.Segment = CT.Class({
	CLASSNAME: "zero.core.Flora.Segment",
	enders: function(variety) {
		var i, oz = this.opts, pz = oz.parts,
			endz = zero.core.Flora.enders,
			subclass = endz.subclasses[variety],
			sing = endz.sings[variety];
		for (i = 0; i < CT.data.random(oz[variety] + 1); i ++) {
			pz.push(CT.merge({
				subclass: subclass,
				index: i,
				name: sing + i,
				kind: sing
			}, oz));
		}
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts, r = Math.random;
		if (oz.level) {
			for (i = 0; i < oz.branches; i++) {
				pz.push(CT.merge({
					subclass: zero.core.Flora.Branch,
					index: i,
					name: "branch" + i,
					kind: "branch",
					scale: [0.8, 0.8, 0.8],
					rotation: [r() - 0.5, r() - 0.5, r() - 0.5]
				}, oz));
			}
		} else
			["leaves", "fruits", "flowers"].forEach(this.enders);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.stem)
			}
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Leaf = CT.Class({
	CLASSNAME: "zero.core.Flora.Leaf",
	init: function(opts) {
		this.opts = CT.merge({
			coneGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.leaf)
			}
		}, opts, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Fruit = CT.Class({
	CLASSNAME: "zero.core.Flora.Fruit",
	init: function(opts) {
		this.opts = CT.merge({
			sphereGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.fruit)
			}
		}, opts, this.opts);
	}
}, zero.core.Thing);

zero.core.Flora.Flower = CT.Class({
	CLASSNAME: "zero.core.Flora.Flower",
	init: function(opts) {
		// TODO: add petals!
		this.opts = CT.merge({
			sphereGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.flower)
			}
		}, opts, this.opts);
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