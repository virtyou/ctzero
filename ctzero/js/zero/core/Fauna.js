zero.core.Fauna = CT.Class({
	CLASSNAME: "zero.core.Fauna",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, tbase,
			i, soz, bmat = this.materials.body;
		if (oz.head) {
			pz.push({
				subclass: zero.core.Fauna.Head,
				name: "header",
				kind: "head",
				animal: this,
				matinstance: bmat,
				sphereGeometry: oz.heft,
				scale: [oz.head, oz.head, oz.head]
			});
		}
		for (i = 0; i < oz.segments; i++) {
			soz = {
				subclass: zero.core.Fauna.Segment,
				index: i,
				name: "segment" + i,
				kind: "segment",
				animal: this,
				matinstance: bmat,
				sphereGeometry: oz.heft,
				position: [0, 0, oz.heft],
				scale: [oz.taper, oz.taper, oz.taper]
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
		if (oz.tail) {
			tbase = zero.base.body.tail[oz.tail];
			pz.push(CT.merge({
				name: "wagger",
				kind: "tail",
				thing: "Tail",
				matinstance: bmat,
				offx: Math.PI / 2,
				position: [0, 0, 0]
			}, tbase));
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
			tail: false,
			head: 1, // scale
			heft: 4, // body segment size
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
			mat = mats[kind] || mats.body, plur = kind + "s",
			count = aoz[plur], seg = Math.PI * 2 / count,
			sub = zero.core.Fauna[CT.parse.capitalize(kind)],
			roff = (count == 4 || count == 8) ? (Math.PI / count) : 0;
		for (i = 0; i < count; i++) {
			pz.push({
				subclass: sub,
				index: i,
				name: kind + i,
				kind: kind,
				animal: ani,
				matinstance: mat,
				rotation: [0, i * seg + roff, level]
			});
		}
	},
	preassemble: function() {
		var aoz = this.opts.animal.opts;
		aoz.wings && this.limbs("wing", 2);
		aoz.legs && this.limbs("leg", 1);
	}
}, zero.core.Thing);

zero.core.Fauna.Wing = CT.Class({
	CLASSNAME: "zero.core.Fauna.Wing",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			coneGeometry: 8,
			scale: [0.2, 1, 1]
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Fauna.Leg = CT.Class({
	CLASSNAME: "zero.core.Fauna.Leg",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, ani = oz.animal,
			i, aoz = ani.opts, mat = ani.materials.body;
		for (i = 0; i < 2; i++) {
			soz = {
				subclass: zero.core.Fauna.Bone,
				index: i,
				name: "bone" + i,
				kind: "bone",
				matinstance: mat,
				position: [-3, 6, 0],
				rotation: [0, 0, i],
				scale: [aoz.taper, aoz.taper, aoz.taper]
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
	}
}, zero.core.Thing);

zero.core.Fauna.Bone = CT.Class({
	CLASSNAME: "zero.core.Fauna.Bone",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: 1,
			geomult: 8
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Fauna.Head = CT.Class({
	CLASSNAME: "zero.core.Fauna.Head",
	preassemble: function() {
		// TODO: Eyes, Ears, Mouth, Hair?
	}
}, zero.core.Thing);

// TODO:
// - motion > tick, springz
// - movement > wander

// TODO: zero.core.Collection base class for Menagerie/Garden?
zero.core.Fauna.Menagerie = CT.Class({
	CLASSNAME: "zero.core.Fauna.Menagerie",
	row: function(animal, spacing, x) {
		var i, oz = this.opts, pz = oz.parts,
			width = oz[animal] * spacing,
			z = -width / 2;
		for (i = 0; i < oz[animal]; i++) {
			pz.push({
				thing: "Fauna",
				index: i,
				name: animal + i,
				kind: animal,
				position: [x, 0, z]
			});
			z += spacing;
		}
	},
	random: function(animals) {},
	preassemble: function() {
		if (this.opts.mode == "rows") {
			this.row("moth", 30, 50);
			this.row("snake", 80, 0);
			this.row("spider", 50, -50);
			this.row("centipede", 80, -100);
		} else
			["moth", "snake", "spider", "centipede"].forEach(this.random);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			mode: "rows", // |random
			moth: 1,
			snake: 1,
			spider: 1,
			centipede: 1
		}, this.opts);
	}
}, zero.core.Thing);