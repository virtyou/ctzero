zero.core.Fauna = CT.Class({
	CLASSNAME: "zero.core.Fauna",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, i, soz;
		for (i = 0; i < oz.segments; i++) {
			soz = {
				subclass: zero.core.Fauna.Segment,
				index: i,
				name: "segment" + i,
				kind: "segment",
				animal: this,
				position: [0, 8, 0],
				scale: [oz.taper, oz.taper, oz.taper]
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
	},
	buildMaterials: function() {
		var oz = this.opts, mats = this.materials = {},
			randMat = zero.core.util.randMat;
		mats.body = randMat(oz.body);
		if (oz.wings)
			mats.wing = randMat(oz.wing);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.base.fauna[opts.kind], {
			body: "brown",
			eye: "green",
			wing: "yellow",
			segments: 1,
			taper: 1, // segment scale multiplier
			wings: 0, // per body segment
			legs: 0 // per body segment
		}, this.opts);
		this.buildMaterials();
	}
}, zero.core.Thing);

zero.core.Fauna.Segment = CT.Class({
	CLASSNAME: "zero.core.Fauna.Segment",
	limbs: function(kind, level) {
		var oz = this.opts, pz = oz.parts, ani = oz.animal,
			i, aoz = ani.opts, mats = ani.materials,
			plur = kind + "s", seg = Math.PI * 2 / aoz[plur],
			sub = zero.core.Fauna[CT.parse.capitalize(kind)],
			mat = mats[kind] || mats.body;
		for (i = 0; i < aoz[plur]; i++) {
			pz.push({
				subclass: sub,
				index: i,
				name: kind + i,
				kind: kind,
				matinstance: mat,
				rotation: [0, i * seg, level]
			});
		}
	},
	preassemble: function() {
		var aoz = this.opts.animal.opts;
		aoz.wings && this.limbs("wing", 2);
		aoz.legs && this.limbs("leg", 1);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			sphereGeometry: 8,
			matinstance: opts.animal.materials.body
		}, this.opts);
	}
});

zero.core.Fauna.Wing = CT.Class({
	CLASSNAME: "zero.core.Fauna.Wing",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: 4,
			scale: [0.2, 1, 1]
		}, this.opts);
	}
});

// TODO:
// - Leg (cylinder segments w/ knee)
// - Head > Eyes, Ears
// - motion > tick, springz
// - movement > wander