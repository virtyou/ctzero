zero.core.Fauna = CT.Class({
	CLASSNAME: "zero.core.Fauna",
	tick: function(dts) {
		var oz = this.opts;
		this.direct(oz.speed * dts);
		if (!zero.core.camera.visible(this.segment0)) return;
		var i, t = zero.core.util.ticker + this.randOff;
		this.tickers[0] = (t + 3 * this.tOff) % oz.tickSegs;
		this.tickers[1] = (t + this.tOff) % oz.tickSegs;
		this.tickers[2] = t % oz.tickSegs;
		this.tickers[3] = (t + 2 * this.tOff) % oz.tickSegs;
		oz.hairStyle && this.header[oz.hairStyle].tick();
		this.segment0 && this.segment0.tick();
		this.bobber && this.adjust("position", "y",
			this.homeY + this.bobber[t % oz.bobSegs]);
	},
	direct: function(amount) {
		var zcu = zero.core.util;
		if (zcu.outBound(this, this.within)) {
			this.look(zcu.randPos(true, this.homeY, this.within));
			delete this.direction;
		}
		if (!this.direction)
			this.direction = this.group.getWorldDirection();
		this.adjust("position", "x", amount * this.direction.x, true);
		this.adjust("position", "z", amount * this.direction.z, true);
	},
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, tbase,
			i, soz, bmat = this.materials.body;
		if (oz.headScale) {
			pz.push({
				subclass: zero.core.Fauna.Head,
				name: "header",
				kind: "head",
				animal: this,
				matinstance: this.materials.head,
				position: [0, oz.headY, 0],
				sphereGeometry: oz.heft,
				scale: [oz.headScale, oz.headScale, oz.headScale]
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
				position: [0, 0, -oz.heft],
				scale: [oz.taper, oz.taper, oz.taper]
			};
			pz.push(soz);
			pz = soz.parts = [];
		}
		if (oz.tailStyle) {
			tbase = zero.base.body.tail[oz.tailStyle];
			pz.push(CT.merge({
				name: "wagger",
				kind: "tail",
				thing: "Tail",
				matinstance: this.materials.tail,
				position: [0, 0, -oz.tailZ]
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
		["head", "tail", "leg", "ear"].forEach(function(kind) {
			mats[kind] = oz[kind] ? randMat(oz[kind]) : mats.body;
		});
	},
	init: function(opts) {
		opts = this.opts = CT.merge(opts, zero.base.fauna[opts.kind], {
			basicBound: true,
			body: "brown",
			eye: "green",
			wing: "yellow",
			mouth: "red",
			hair: "blue",
			head: null, // defaults to body
			tail: null, // defaults to body
			leg: null, // defaults to body
			ear: null, // defaults to body
			speed: 20,
			tickSegs: 60,
			bobSegs: 30,
			segments: 1,
			wiggle: false,
			bob: 0,
			beakness: 1,
			headScale: 1, // scale
			heft: 4, // body segment size
			taper: 1, // segment scale multiplier
			wings: 0, // per body segment
			legs: 0, // per body segment
			eyes: 2,
			headY: 0,
			tailZ: 0,
			limbMult: 8,
			limbScale: 1,
			wingSmush: 0.2,
			flapDim: "z"
		}, this.opts);
		if (opts.within)
			this.within = opts.within;
		this.buildMaterials();
		this.tOff = opts.tickSegs / 4;
		this.tickers = [];
		this.randOff = CT.data.random(100);
		this.ticker = zero.core.trig.segs(opts.tickSegs, 0.5);
		this.wiggler = opts.wiggle && zero.core.trig.segs(opts.wiggle, 0.05);
		this.bobber = opts.bob && zero.core.trig.segs(opts.bobSegs, opts.bob);
	}
}, zero.core.Thing);

zero.core.Fauna.Segment = CT.Class({
	CLASSNAME: "zero.core.Fauna.Segment",
	tick: function() {
		var seg, leg, lego, wing, wingo, oz = this.opts,
			anim = oz.animal, aoz = anim.opts, index = oz.index,
			tz = anim.tickers, legz = this.legz, lindex = index * 2,
			wingz = this.wingz + anim.ticker[tz[0]];
		anim.wiggler && this.adjust("rotation", "y",
			anim.wiggler[(oz.index + zero.core.util.ticker) % aoz.wiggle]);
		if (this.wing)
			for (wingo in this.wing)
				this.wing[wingo].adjust("rotation", aoz.flapDim, wingz);
		else if (this.leg) {
			for (lego in this.leg) {
				leg = this.leg[lego];
				leg.adjust("rotation", "z", legz + anim.ticker[tz[lindex % 4]]);
				lindex += 1;
			}
		}
		if (this.segment) {
			for (seg in this.segment) // should only be one
				this.segment[seg].tick();
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
			legShift = aoz.legShift ? (oz.index % 2 ? -1 : 1) : 0,
			scaleX = aoz.limbScale;
		if (kind == "wing")
			scaleX *= aoz.wingSmush;
		for (i = 0; i < count; i++) {
			pz.push({
				subclass: sub,
				index: i,
				name: kind + i,
				kind: kind,
				animal: ani,
				matinstance: mat,
				rotation: [0, i * seg + roff + legShift, level],
				scale: [scaleX, aoz.limbScale, aoz.limbScale]
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
		var aoz = opts.animal.opts;
		this.opts = CT.merge(opts, {
			coneGeometry: 8,
			geomult: aoz.wingMult || aoz.limbMult
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Fauna.Leg = CT.Class({
	CLASSNAME: "zero.core.Fauna.Leg",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts, ani = oz.animal,
			aoz = ani.opts, mat = ani.materials.leg,
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
				geomult: aoz.limbMult
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
			i, z = aoz.heft, posz = [];
		for (i = 0; i < aoz.eyes; i++)
			posz.push([(i % 2) * 2 - 1, Math.floor(i / 2), z]);
		return posz;
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts, animal = oz.animal,
			aoz = animal.opts, placement = this.eyePlacement(),
			h = aoz.heft, my = -h / 2, mz = Math.sqrt(h * h - my * my),
			earSize = h / 6, earX = earSize;
		pz.push({
			name: "mouth",
			kind: "facial",
			scale: [2, 1, aoz.beakness],
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
				matinstance: animal.materials.ear
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

zero.core.Fauna.sets = {
	fire: {
		moth: 2
	},
	pool: {
		eel: 2,
		fish: 4,
		spider: 1,
		centipede: 1
	},
	cavern: {
		ant: 1,
		snake: 1,
		spider: 1,
		centipede: 1,
		lizard: 1,
		rat: 1,
		bat: 1
	},
	field: {
		snake: 1,
		horse: 1,
		bird: 1,
		wasp: 1,
		bee: 1,
		cow: 2
	},
	town: {
		cat: 1,
		dog: 2
	}
};
zero.core.Fauna.setter = "menagerie";
zero.core.Fauna.Menagerie = CT.Class({
	CLASSNAME: "zero.core.Fauna.Menagerie",
	kinds: ["horse", "moth", "snake", "spider", "ant", "centipede", "lizard", "cow", "eel", "fish", "bee", "wasp", "rat", "bat", "bird", "cat", "dog"],
	counts: {
		ant: 1,
		moth: 1,
		snake: 1,
		spider: 1,
		centipede: 1,
		horse: 1,
		lizard: 1,
		cow: 1
	},
	sets: zero.core.Fauna.sets,
	member: "Fauna",
	tick: function(dts) {
		if (this.awaitBound || !this.isReady()) return;
		var kind, name;
		for (kind of this.kinds)
			for (name in this[kind])
				this[kind][name].tick(dts);
	},
	onremove: function() {
		this.opts.regTick && zero.core.current.room.unregTicker(this);
	},
	init: function(opts) {
		this.opts.regTick && zero.core.current.room.regTicker(this);
	}
}, zero.core.Collection);