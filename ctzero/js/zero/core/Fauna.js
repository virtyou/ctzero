zero.core.Fauna = CT.Class({
	CLASSNAME: "zero.core.Fauna",
	tick: function(dts) {
		var oz = this.opts, t = zero.core.util.ticker,
			t1 = t % 60, t2 = (t + 30) % 60, w = this.wiggler;
		oz.hairStyle && this.header[oz.hairStyle].tick();
		this.segment0 && this.segment0.tick(this.ticker[t1],
			this.ticker[t2], w && w[t1], w && w[t2]);
	},
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
				position: [0, oz.headY, 0],
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
				position: [0, 0, 20]
			}, tbase));
		}
	},
	buildMaterials: function() {
		var oz = this.opts, mats = this.materials = {},
			randMat = zero.core.util.randMat;
		["body", "mouth", "hair"].forEach(function(kind) {
			mats[kind] = randMat(oz[kind]);
		});
		["wing", "eye"].forEach(function(kind) {
			if (oz[kind + "s"])
				mats[kind] = randMat(oz[kind]);
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.base.fauna[opts.kind], {
			body: "brown",
			eye: "green",
			wing: "yellow",
			mouth: "red",
			hair: "blue",
			segments: 1,
			tail: false,
			head: 1, // scale
			heft: 4, // body segment size
			taper: 1, // segment scale multiplier
			wings: 0, // per body segment
			legs: 0, // per body segment
			eyes: 2,
			headY: 0
		}, this.opts);
		this.buildMaterials();
		this.ticker = zero.core.trig.segs(60, 0.5);
		this.wiggler = this.opts.wiggle && zero.core.trig.segs(60, 0.1);
	}
}, zero.core.Thing);

zero.core.Fauna.Segment = CT.Class({
	CLASSNAME: "zero.core.Fauna.Segment",
	tick: function(t1, t2, w1, w2) {
		var seg, leg, lego, wing, wingo,
			oz = this.opts, index = oz.index,
			legz1 = this.legz + t1, legz2 = this.legz + t2,
			wingz = this.wingz + t1;
		w1 && this.adjust("rotation", "y", (index % 2) ? w1 : w2);
		if (this.leg) for (lego in this.leg) {
			leg = this.leg[lego];
			leg.adjust("rotation", "z", ((index + leg.opts.index) % 2) ? legz1 : legz2);
		}
		if (this.wing)
			for (wingo in this.wing)
				this.wing[wingo].adjust("rotation", "z", wingz);
		if (this.segment) {
			for (seg in this.segment) // should only be one
				this.segment[seg].tick(t1, t2);
		} else if (this.wagger)
			this.wagger.tick();
	},
	limbs: function(kind, level) {
		var oz = this.opts, pz = oz.parts, ani = oz.animal,
			i, aoz = ani.opts, mats = ani.materials,
			mat = mats[kind] || mats.body, plur = kind + "s",
			count = aoz[plur], seg = Math.PI * 2 / count,
			sub = zero.core.Fauna[CT.parse.capitalize(kind)],
			roff = (count == 4 || count == 8) ? (Math.PI / count) : 0,
			legShift = aoz.legShift ? (oz.index % 2 ? 1 : -1) : 0;
		for (i = 0; i < count; i++) {
			pz.push({
				subclass: sub,
				index: i,
				name: kind + i,
				kind: kind,
				animal: ani,
				matinstance: mat,
				rotation: [0, i * seg + roff + legShift, level]
			});
			legShift *= -1;
		}
	},
	preassemble: function() {
		var aoz = this.opts.animal.opts;
		this.wingz = 2;
		this.legz = aoz.legShift ? 2 : 1;
		aoz.wings && this.limbs("wing", this.wingz);
		aoz.legs && this.limbs("leg", this.legz);
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
			aoz = ani.opts, mat = ani.materials.body,
			i, size = aoz.heft / 4;
		for (i = 0; i < 2; i++) {
			soz = {
				index: i,
				name: "bone" + i,
				kind: "bone",
				matinstance: mat,
				rotation: [0, 0, i],
				position: [-3 * size, 6 * size, 0],
				scale: [aoz.taper, aoz.taper, aoz.taper],
				cylinderGeometry: size,
				geomult: 8
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
	}
}, zero.core.Thing);

zero.core.Fauna.Head = CT.Class({
	CLASSNAME: "zero.core.Fauna.Head",
	eyePlacement: function() {
		var oz = this.opts, aoz = oz.animal.opts,
			i, z = -aoz.heft, posz = [];
		for (i = 0; i < aoz.eyes; i++)
			posz.push([(i % 2) * 2 - 1, Math.floor(i / 2), z]);
		return posz;
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts, animal = oz.animal,
			aoz = animal.opts, placement = this.eyePlacement(),
			h = aoz.heft, my = -h / 2, mz = -Math.sqrt(h * h - my * my),
			earSize = h / 6, earX = earSize;
		pz.push({
			name: "mouth",
			kind: "facial",
			scale: [2, 1, 1],
			sphereGeometry: 1,
			position: [0, my, mz],
			matinstance: animal.materials.mouth
		});
		for (i = 0; i < 2; i++) {
			pz.push({
				index: i,
				name: "ear" + i,
				kind: "facial",
				geomult: aoz.earMult,
				coneGeometry: earSize,
				position: [earX, h, 0],
				rotation: [0, 0, i - 0.5],
				matinstance: animal.materials.body
			});
			earX *= -1;
		}
		for (i = 0; i < aoz.eyes; i++) {
			pz.push({
				index: i,
				name: "eye" + i,
				kind: "facial",
				sphereGeometry: 1,
				position: placement[i],
				matinstance: animal.materials.eye
			});
		}
		aoz.hairStyle && pz.push(CT.merge(zero.base.body.hair[aoz.hairStyle], {
			name: aoz.hairStyle,
			kind: "hair",
			thing: "Hair",
			matinstance: animal.materials.hair
		}));
	}
}, zero.core.Thing);

// TODO: movement > wander [ orient ; move ]

// TODO: zero.core.Collection base class for Menagerie/Garden?
zero.core.Fauna.Menagerie = CT.Class({
	CLASSNAME: "zero.core.Fauna.Menagerie",
	kinds: ["horse", "moth", "snake", "spider", "ant", "centipede"],
	counts: {
		ant: 1,
		moth: 1,
		snake: 1,
		spider: 1,
		centipede: 1,
		horse: 1
	},
	member: "Fauna",
	tick: function(dts) {
		var kind, name;
		for (kind of this.kinds)
			for (name in this[kind])
				this[kind][name].tick(dts);
	}
}, zero.core.Collection);