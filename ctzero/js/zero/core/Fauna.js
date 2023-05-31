zero.core.Fauna = CT.Class({
	CLASSNAME: "zero.core.Fauna",
	tick: function(dts) {
		var oz = this.opts;
		this.direct(oz.speed * dts);
		if (!zero.core.camera.visible(this.segment0)) return;
		var i, t = zero.core.util.ticker + this.randOff;
		for (i = 0; i < 4; i++)
			this.tickers[i] = this.ticker[(t + this.tOffs[i]) % oz.tickSegs];
		oz.hairStyle && this.header[oz.hairStyle].tick();
		this.segment0 && this.segment0.tick();
		this.bobber && this.adjust("position", "y",
			this.homeY + this.bobber[t % oz.bobSegs]);
	},
	hurry: function(hval, hint) {
		var thaz = this;
		this.urgency = hval || 8;
		setTimeout(function() {
			delete thaz.urgency;
		}, hint || 1000);
	},
	scurry: function() {
		delete this.direction;
		this.hurry(20);
	},
	knock: function(direction) {
		this.direction = direction;
		this.hurry(40);
	},
	pounce: function(target, perch) {
		if (perch)
			target = target.head;
		this.look(target.position(null, perch));
		this.getDirection();
		this.hurry(perch && 16, 400);
		if (perch)
			this.perching = target;
		else
			this.setBob(40, 500);
	},
	unperch: function() {
		delete this.perch;
		this.scurry();
		this.setBob(40, 500);
	},
	unbob: function() {
		delete this.bobber;
		this.adjust("position", "y", this.homeY);
	},
	setBob: function(amp, unbobafter) {
		this.bobber = zero.core.trig.segs(this.opts.bobSegs, amp);
		unbobafter && setTimeout(this.unbob, unbobafter);
	},
	glow: function() {
		zero.core.util.glow(this.materials.body);
	},
	yelp: function() {
		var zc = zero.core, aud = zc.Fauna.audio, k = this.opts.kind, vol;
		if (k in aud) {
			vol = zc.util.close2u(this) / 2;
			this.log(k, "yelping at", vol);
			zc.audio.sfx(CT.data.choice(aud[k]), vol, true);
		}
	},
	randPos: function() {
		var rp = zero.core.util.randPos(true, this.homeY, this.within);
		this.adjust("position", "x", rp.x);
		this.adjust("position", "z", rp.z);
	},
	repos: function(pos, bobin) {
		bobin && this.setBob(80, 500);
		if (!pos) return this.randPos();
		this.adjust("position", "x", pos.x);
		this.adjust("position", "z", pos.z);
	},
	direct: function(amount) {
		var zc = zero.core, zcu = zc.util, pp;
		if (!this.direction || zcu.outBound(this, this.within)) {
			this.look(zcu.randPos(true, this.homeY, this.within));
			this.getDirection();
		}
		if (this.urgency)
			amount *= this.urgency;
		if (this.perch) {
			pp = this.perch.position(null, true);
			this.adjust("position", "x", pp.x);
			this.adjust("position", "y", pp.y);
			this.adjust("position", "z", pp.z);
			zc.current.person.zombified || this.unperch();
		} else {
			this.adjust("position", "x", amount * this.direction.x, true);
			this.adjust("position", "z", amount * this.direction.z, true);
			if (this.perching) {
				this.adjust("position", "y", amount * this.direction.y, true);
				this.perch = this.perching;
				delete this.perching;
			}
		}
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
				position: [0, oz.tailX, -oz.tailZ],
				rotation: [oz.tailXR, 0, 0]
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
			tailX: 0,
			tailXR: 0,
			limbMult: 8,
			limbScale: 1,
			earFactor: 6,
			wingSmush: 0.2,
			flapDim: "z"
		}, this.opts);
		if (opts.within)
			this.within = opts.within;
		this.buildMaterials();
		this.tickers = [];
		var toff = opts.tickSegs / 4;
		this.tOffs = [3 * toff, toff, 0, 2 * toff];
		this.randOff = CT.data.random(100);
		this.ticker = zero.core.trig.segs(opts.tickSegs, 0.5);
		this.wiggler = opts.wiggle && zero.core.trig.segs(opts.wiggle, 0.05);
		opts.bob && this.setBob(opts.bob);
	}
}, zero.core.Thing);

zero.core.Fauna.Segment = CT.Class({
	CLASSNAME: "zero.core.Fauna.Segment",
	tick: function() {
		var seg, leg, lego, wing, wingo, oz = this.opts,
			anim = oz.animal, aoz = anim.opts, index = oz.index,
			tz = anim.tickers, legz = this.legz, lindex = index * 2,
			wingz = this.wingz + tz[0];
		anim.wiggler && this.adjust("rotation", "y",
			anim.wiggler[(oz.index + zero.core.util.ticker) % aoz.wiggle]);
		if (this.wing)
			for (wingo in this.wing)
				this.wing[wingo].adjust("rotation", aoz.flapDim, wingz);
		else if (this.leg) {
			for (lego in this.leg) {
				leg = this.leg[lego];
				leg.adjust("rotation", "z", legz + tz[lindex % 4]);
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
			earSize = h / aoz.earFactor, earX = earSize, hobj;
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
		if (aoz.hairStyle) {
			hobj = {
				name: aoz.hairStyle,
				kind: "hair",
				thing: "Hair",
				matinstance: animal.materials.hair
			};
			if (aoz.hairY)
				hobj.position = [0, aoz.hairY, 4];
			pz.push(CT.merge(hobj,
				zero.base.body.hair[aoz.hairStyle]));
		}
	}
}, zero.core.Thing);

zero.core.Fauna.sets = {
	bush: {
		bee: 2
	},
	tree: {
		bird: 1
	},
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
	},
	farm: {
		pig: 2,
		sheep: 1,
		chicken: 3,
		bunny: 1
	},
	pets: {
		dog: 1,
		cat: 2,
		rat: 3,
		bird: 2
	}
};
zero.core.Fauna.defaultSet = {
	ant: 1,
	moth: 1,
	snake: 1,
	spider: 1,
	centipede: 1,
	horse: 1,
	lizard: 1,
	cow: 1
};
zero.core.Fauna.hunters = {
	dog: ["cat", "rat", "snake"],
	cat: ["rat", "bird", "chicken", "bunny", "lizard"],
	snake: ["cat", "rat", "bunny"],
	lizard: ["spider"],
	spider: ["ant"]
};
zero.core.Fauna.setter = "menagerie";
zero.core.Fauna.kinds = ["horse", "moth", "snake", "spider", "ant", "centipede", "lizard", "cow", "eel", "fish", "bee", "wasp", "rat", "bat", "bird", "cat", "dog", "pig", "sheep", "chicken", "bunny"];
zero.core.Fauna.Menagerie = CT.Class({
	CLASSNAME: "zero.core.Fauna.Menagerie",
	kinds: zero.core.Fauna.kinds,
	sets: zero.core.Fauna.sets,
	counts: zero.core.Fauna.defaultSet,
	member: "Fauna",
	removables: false,
	tick: function(dts) {
		if (this.awaitBound || !this.isReady()) return;
		var kind, name;
		for (kind of this.kinds)
			for (name in this[kind])
				this[kind][name].tick(dts);
	},
	onremove: function() {
		this.opts.regTick && zero.core.current.room.unregTicker(this);
		clearTimeout(this.yelper);
		clearInterval(this.hunter);
	},
	yelp: function() {
		var crit = this[CT.data.choice(this.members)];
		if (!zero.core.current.person)
			this.log("yelp() skipped - no current person");
		else if (crit)
			crit.yelp();
		this.yelper = setTimeout(this.yelp, 10000 + CT.data.random(10000));
	},
	pounce: function(hunter, prey) {
		this.log("POUNCE!", hunter.name, prey.name);
		hunter.pounce(prey);
		prey.scurry();
	},
	hit: function(striker, preykinds, hitter, cfg, nohit, onhit, isheld) {
		var zc = zero.core, touching = zc.util.touching,
			zcc = zc.current, source, sb, pk, p, prey, sfx, hitting;
		for (pk of preykinds) {
			if (this[pk]) {
				source = cfg[pk].source;
				sb = source && zcc.people[source].body;
				for (p in this[pk]) {
					prey = this[p];
					if (touching(striker, prey, 50, isheld, isheld)) {
						hitting = true;
						if (hitter(prey)) {
							prey.repos(sb && sb.position(), true);
							sfx = "splat";
						} else {
							prey.yelp();
							prey.glow();
							onhit && onhit(prey);
						}
					}
				}
			}
		}
		hitting || (nohit && nohit());
		return sfx;
	},
	splat: function(preykinds, onsplat, splatcfg, nosplat) {
		return this.hit(zero.core.current.person.body,
			preykinds, onsplat, splatcfg, nosplat);
	},
	knocker: function(prey, knocker) {
		this.log(prey.name, "knocked by", knocker.name);
		prey.knock(zero.core.current.person.body.front.getDirection());
	},
	knock: function(preykinds, onknock, knockcfg, side) {
		var knocker = zero.core.current.person.held(side, true);
		return this.hit(knocker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => this.knocker(prey, knocker), true);
	},
	sniff: function(hunterkind, preykind) {
		var hunter, prey, h, p, touching = zero.core.util.touching;
		for (h in this[hunterkind]) {
			hunter = this[h];
			for (p in this[preykind]) {
				prey = this[p];
				if (touching(hunter, prey, 200))
					return this.pounce(hunter, prey);
			}
		}
	},
	monHunt: function(hunter) {
		var zc = zero.core, playerbod = zc.current.person.body;
		if (zc.util.touching(hunter, playerbod, 150))
			hunter.pounce(playerbod, this.onmonsterpounce(hunter));
	},
	monsterHunt: function() {
		if (zero.core.current.person.zombified) return;
		for (var hunter of this.monsters)
			this.each(hunter, this.monHunt);
	},
	hunt: function() {
		var hunter, prey, hunters = zero.core.Fauna.hunters;
		this.monsters && this.monsterHunt();
		for (hunter in hunters) {
			if (this[hunter]) {
				for (prey of hunters[hunter]) {
					this[prey] && this.sniff(hunter, prey);
				}
			}
		}
	},
	huntPlayer: function(hunters, onpounce) {
		var hunter, minimap = zero.core.current.minimap;
		this.monsters = hunters;
		this.onmonsterpounce = onpounce;
		for (hunter of hunters)
			this.each(hunter, minimap.monster);
	},
	each: function(kind, cb) {
		var name;
		if (this[kind])
			for (name in this[kind])
				cb(this[name]);
	},
	setProp: function(kinds, key, val) {
		if (!Array.isArray(kinds))
			kinds = [kinds];
		var setit = function(creature) {
			creature[key] = val;
		};
		kinds.forEach(kind => this.each(kind, setit));
	},
	init: function(opts) {
		if (zero.core.Fauna.audio) // set by ctone...
			this.yelper = setTimeout(this.yelp, 3000 + CT.data.random(10000));
		this.hunter = setInterval(this.hunt, 3000);
		this.opts.regTick && zero.core.current.room.regTicker(this);
	}
}, zero.core.Collection);