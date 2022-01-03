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
			color: "brown",
			stems: 1,
			levels: 2, // max depth (branch layers)
			segments: 2, // max per branch(?) ; stem total
			branches: 2, // max per segment
			leaves: 3, // max per segment - outer branches mostly?
			flower: "blossom", // |berry|fruit - outer branches only
		});
	}
}, zero.core.Thing);

zero.core.Flora.Stem = CT.Class({
	CLASSNAME: "zero.core.Flora.Stem",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts,
			i, lev = oz.level - 1;
		for (i = 0; i < oz.segments; i++) {
			pz.push(CT.merge({
				subclass: zero.core.Flora.Segment,
				index: i,
				name: "segment" + i,
				kind: "segment"
			}, oz));
		}
	}
}, zero.core.Thing);

zero.core.Flora.Branch = CT.Class({
	CLASSNAME: "zero.core.Flora.Branch"
}, zero.core.Flora.Stem);

zero.core.Flora.Segment = CT.Class({
	CLASSNAME: "zero.core.Flora.Segment",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true,
			material: {
				color: zero.core.util.randHue(opts.color)
			}
		});
	}
}, zero.core.Thing);

zero.core.Flora.Leaf = CT.Class({
	CLASSNAME: "zero.core.Flora.Leaf",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: true,
			material: {
				color: zero.core.util.randHue("green")
			}
		});
	}
}, zero.core.Thing);

zero.core.Flora.Fruit = CT.Class({
	CLASSNAME: "zero.core.Flora.Fruit",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			sphereGeometry: true,
			material: {
				color: zero.core.util.randHue("red")
			}
		});
	}
}, zero.core.Thing);