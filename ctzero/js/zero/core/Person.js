zero.core.Person = CT.Class({
	CLASSNAME: "zero.core.Person",
	_: {
		bouncer: 1,
		doPlay: function(cb) {
			var audio = this._.audio;
			audio.play().then(cb)["catch"](function(error) {
				if (error.code == 20)
					return; // skip it!
				var mp = CT.dom.button("CLICK TO CHAT", function() {
					CT.dom.remove(mp);
					audio.play();
					cb && cb();
				}, "fixed all20p gigantic translucent roundest");
				document.body.appendChild(mp);
			});
		},
		playClip: function(d) {
			var _ = this._;
			if (d.data)
				d = this.brain.data2clip(d.data);
			_.audio.src = d.url;
			_.doPlay(function() {
				d.visemes.forEach(function(vis) {
					setTimeout(_.setPho, vis.time, vis.value);
				});
			});
		},
		setPho: function(pho) {
		    this.head.currentPhoneme = pho;
		},
		initSpeech: function() {
			this._.audio = document.createElement("audio");
			document.body.appendChild(this._.audio);
		},
		chain: function(cb) {
			var chain = this.brain.chain;
			if (chain) {
				delete this.brain.chain;
				setTimeout(this.respond,
					core.config.ctzero.brain.chain.delay,
					chain, cb);
			} else
				cb && cb();
		},
		neutral: function(side, sub, nval) {
			var part, axis, resetz = {}, aspz = zero.base.aspects,
				held = this.opts.gear.held || {};
			(side ? [side] : ["left", "right"]).forEach(function(side) {
				resetz[side] = {};
				(sub ? [sub] : ((held[side] && !nval) ? ["arm"] : ["arm", "hand"])).forEach(function(sub) {
					resetz[side][sub] = {};
					for (part in aspz[sub]) {
						resetz[side][sub][part] = {};
						for (axis in aspz[sub][part])
							resetz[side][sub][part][axis] = nval || 0;
					}
				});
			});
			return resetz;
		}
	},
	mutesfx: function() {
		delete this._.sfx;
	},
	sfx: function(sound) {
		var afiles = this._.sfx && this._.sfx[sound], vol = 1;
		if (!afiles) return;
		var curper = zero.core.current.person;
		if (curper && this != curper)
			vol = zero.core.util.close2u(this.body);
		this.opts.verbose && this.log("playing", sound, "at", vol);
		zero.core.audio.sfx(CT.data.choice(afiles), vol);
	},
	click: function() {
		this.body.group.__click && this.body.group.__click();
	},
	setVolume: function(v) {
		this._.audio.volume = v;
	},
	afterSpeech: function(cb) {
		this._.audio.onended = cb;
	},
	setSmile: function(degree, unsmile) {
		degree = degree || 0;
		var smiler = this.head.springs.bigSmile;
		this.log("setSmile", degree, unsmile);
		smiler.target = degree;
		unsmile && setTimeout(function() {
			smiler.target = 0;
		}, 5000);
	},
	setFriction: function() { // roller skates, ice, etc
		this.body.setFriction(this.grippy &&
//			zero.core.current.person == this &&
			(this.body.upon || zero.core.current.room).grippy);
	},
	onsay: function(cb) {
		this._.onsay = cb;
	},
	onsaid: function(cb) {
		this._.onsaid = cb;
	},
	say: function(data, cb, watch) {
		var _ = this._;
		zero.core.rec.cancel();
		watch && this.watch(false, true);
		if (data.audio)
			_.playClip(this.brain.say_data(data, cb));
		else {
			this.mood.tick();
			_.onsay && _.onsay(data, this);
			this.brain.say(data, function() {
				cb && cb();
				_.onsaid && _.onsaid(data, this);
			}, _.playClip, this.prosody, this.voice);
		}
	},
	respond: function(phrase, cb, watch, nosaycb) {
		var thaz = this, zcc = zero.core.current;
		if (watch) { // watch both ways....
			watch && this.watch(false, true);
			if (zcc.person && zcc.person != this)
				this.look(zcc.person.body, true);
		}
		nosaycb = nosaycb || this.opts.nosaycb;
		this.brain.respond(phrase, function(words) {
			nosaycb && nosaycb(words);
			(words && !nosaycb) ? thaz.say(words, function() {
				thaz._.chain(cb);
			}) : thaz._.chain(cb);
		});
	},
	tick: function(dts) {
		if (!this.head)
			return this.log("tick() w/o head!");
		this.opts.moody && this.mood.tick();
		this.body.tick(dts);
	},
	watch: function(nofollow, noroom) {
		var cube = this.body.looker;
		if (nofollow)
			zero.core.camera.look(cube.position());
		else
			zero.core.camera.follow(cube);
		if (!noroom) {
			var pz = zero.core.current.people;
			for (var p in pz)
				if (p != this.name)
					 pz[p].look(cube, true);
		}
	},
	unlook: function() {
		delete this.subject;
	},
	look: function(subject, orient) {
		this.subject = subject;
		orient && this.orient(subject);
	},
	orient: function(subject, spos, doafter) {
		var pos = this.body.placer.position;
		spos = spos || subject.position();
		this.orientation(Math.atan2(spos.x
			- pos.x, spos.z - pos.z));
		doafter && setTimeout(doafter, 500);
	},
	touch: function(subject, cb, arm, approached, handCb, force) {
		var zcu = zero.core.util, bod = this.body, bt = bod.torso, spy, contact = function() {
			cb && cb();
			handCb && handCb(bt.hands[arm], subject);
		}, shove = function() {
			bod.shove(zcu.vector(bt.hands[arm].position(null, true),
				subject.position(), true), 1, 20);
			setTimeout(contact, timeout);
		}, timeout = force ? 150 : 600;
		arm = arm || this.freeHand();
		arm && this.approach(approached || subject, function() {
			spy = subject.position(null, true).y;
			if (spy < bt.legs.right.knee.getWorldPosition(zcu._positioner).y)
				bod.springs.bow.target = Math.PI / 4;
			else if (spy < bod.spine.pelvis.getWorldPosition(zcu._positioner).y)
				bod.springs.bow.target = Math.PI / 2;
			setTimeout(function() {
				bt.arms[arm].point("shoulder", subject);
				setTimeout(force ? shove : contact, timeout);
			}, timeout);
		});
	},
	held: function(side, handFallback) {
		var og = this.opts.gear, ikey = og.held && og.held[side];
		if (ikey)
			return zero.core.Thing.get(ikey);
		if (handFallback)
			return this.body.torso.hands[side];
	},
	freeHand: function() {
		var g = this.opts.gear, h = g.held = g.held || {};
		if (h.right) {
			if (h.left)
				return this.say("i don't have any free hands");
			return "left";
		}
		return "right";
	},
	get: function(target, cb) {
		var side = this.freeHand(), g = this.opts.gear,
			h = g.held, gobj = {}, bod = this.body,
			to = target.opts, key = to.key || to.fakeKey,
			held = to.kind == "held", loc;
		side && this.touch(target, function() {
			if (held)
				gobj[side] = h[side] = key;
			else { // TODO: non-spine (body; left/right hand/arm/leg)
				if (!g.worn)
					g.worn = {};
				if (!g.worn.spine)
					g.worn.spine = {};
				loc = to.kind.split("_").pop();
				g.worn.spine[loc] = key;
				gobj[loc] = key;
			}
			zero.core.current.room.removeObject(target);
			target.isConsumable ? target.consume() : bod.gear(gobj, held);
			cb && cb();
		}, side);
	},
	chase: function(subject, cb) {
		this.approach(subject, cb, false, true);
	},
	propel: function(direction) {
		var bs = this.body.springs, vec = this.direction(direction),
			booster = this.zombified ? 200 : 100;
		bs.weave.boost = booster * vec.x;
		bs.slide.boost = booster * vec.z;
	},
	stop: function() {
		if (!this.body) return this.log("aborting stop() (no body)");
		var bs = this.body.springs;
		bs.weave.boost = bs.slide.boost = 0;
		this.undance();
	},
	unchase: function() {
		var _ = this._;
		this.stop();
		if (_.chaser) {
			clearInterval(_.chaser);
			delete _.chaser;
		}
	},
	chaser: function() {
		var _ = this._, cb = _.postchase;
		if (!this.body || this.body.removed || _.chased.removed)
			this.unchase();
		else if (zero.core.util.touching(this.body, _.chased, 20)) {
			_.prevcam && camera.angle(_.prevcam);
			this.unchase();
			cb && cb();
		} else {
			this.orient(_.chased);
			this.propel();
		}
	},
	pursue: function(subject, cb, prevcam) {
		var _ = this._;
		_.postchase = cb;
		_.chased = subject;
		_.prevcam = prevcam;
		_.chaser = setInterval(this.chaser, 500);
	},
	approach: function(subject, cb, watch, chase, dur, nobuff) {
		var _ = this._, bod = this.body, zc = zero.core, dist,
			zcu = zc.util, zcc = zc.current, ppl = zcc.people,
			propel = this.propel, pursue = this.pursue, stop = this.stop,
			bso = bod.springs.orientation, bsohard = bso.hard,
			cam = camera.current, shouldBehind = this.isYou() && (cam != "behind");
		if (typeof subject == "string") {
			if (subject == "player") {
				if (!zcc.person) return cb && cb();
				subject = zcc.person.body;
			} else if (ppl[subject])
				subject = ppl[subject].body;
			else
				subject = zcc.room[subject];
		}
		shouldBehind && camera.angle("behind");
		watch && this.watch(false, true);
		bso.k = 200;
		bso.hard = false;
		this.orient(subject);
		this.go();
		setTimeout(function() {
			if (bod.removed)
				return CT.log("aborting approach - bod removed");
			propel();
			bso.k = 20;
			bso.hard = bsohard;
			if (chase)
				return pursue(subject, cb, shouldBehind && cam);
			if (!dur) {
				dist = zcu.distance(bod.position(), subject.position());
				if (!nobuff)
					dist -= zcu.buff(bod, subject);
				dur = dist * 10;
			}
			setTimeout(function() {
				stop();
				cb && cb();
			}, dur);
		}, 500); // time for orientation...
	},
	bounce: function(amount) {
		var _ = this._;
		amount *= _.bouncer;
		_.bouncer *= 6 / 5;
		if (_.bouncer > 2) {
			this.log("resetting bouncer");
			_.bouncer = 1;
		}
		return amount;
	},
	land: function() {
		var lander = this._.onland;
		this.sfx(lander && lander() || "bump");
	},
	onland: function(cb) {
		this._.onland = cb;
	},
	splash: function(color) {
		var bs = this.body.splash, mat = bs.material;
		if (!color && (mat.color != bs._origColor))
			color = bs._origColor;
		if (color) {
			if (!bs._origColor)
				bs._origColor = mat.color;
			bs.setColor(color);
		}
		bs.release(20);
	},
	shouldFly: function() {
		this._.shouldFly = true;
	},
	stopFlying: function() {
		this.body.landing = true;
		this.body.flying = false;
		this.dance("fall");
	},
	doLeap: function(shouldFly, amount, forwardAmount) {
		shouldFly && this.shouldFly();
		this.jump(amount || 800, forwardAmount);
	},
	leap: function(target, onland, shouldFly, amount, forwardAmount) {
		onland && this.onland(onland);
		this.orient(target, null, // look then leap...
			() => this.doLeap(shouldFly, amount, forwardAmount || 0.3));
	},
	jump: function(amount, forward) {
		var _ = this._, t = zero.core.util.ticker, bod = this.body,
			within = bod.within, sound = "whoosh", spr = bod.springs.bob;
		this.gesture("jump");
		if (within) {
			if (within.opts.state == "liquid") {
				sound = "splash";
				this.splash();
				(t % 10) || bod.bubbletrail.release(1);
			} else if (within.opts.state == "plasma")
				_.shouldFly = true;
		}
		if (_.shouldFly) {
			bod.flying = true;
			delete _.shouldFly;
			setTimeout(this.stopFlying, 8000);
		}
		this.sfx(bod.flying ? "wind" : sound);
		if (spr.floored) {
			spr.boost = this.bounce(amount);
			spr.floored = false;
		} else if (bod.flying || !spr.hard)
			spr.boost = amount;
		forward && bod.shove(this.direction(), forward, null, false, "boost");
	},
	unjump: function() {
		this.body.springs.bob.boost = -50;
	},
	run: function() {
		this.running = true;
		this.mood.reset("energy", 2);
		this.energy.reset("damp", 0.6);
	},
	unrun: function() {
		this.running = false;
		this.mood.reset("energy");
		this.energy.reset("damp");
	},
	go: function(dur) {
		var bod = this.body, within = bod.within,
			dance = bod.flying ? "fly" : "walk",
			t = zero.core.util.ticker;
		this._.bouncer = 1;
		if (within && within.opts.state == "liquid") {
			dance = "swim";
			(t % 20) || bod.bubbletrail.release(1);
		}
		this.dance(dance, dur);
	},
	leave: function(portal, cb) {
		var me = this, zccr = zero.core.current.room;
		this.approach(portal, function() {
			zccr.eject(me, zccr[portal]);
			cb && cb();
		}, true);
	},
	wander: function(where, cb, dur) {
		where = where || "room";
		var r = zero.core.current.room, _ = this._, wantar = _.wantar = _.wantar || {},
			bz = (where == "room") ? r.bounds : r[where].bounds,
			min = bz.min, max = bz.max;
		wantar.weave = (min.x + CT.data.random(max.x - min.x, true)) * 0.9;
		wantar.slide = (min.z + CT.data.random(max.z - min.z, true)) * 0.9;
		this.move(wantar, cb, false, dur);
	},
	move: function(opts, cb, watch, dur) {
		var gotar = this.body.gotar, gtp = gotar.group.position;
		gtp.x = opts.weave;
		gtp.z = opts.slide;
		gtp.y = opts.bob || this.body.placer.position.y;
		this.approach(gotar, cb, watch, false, dur);
	},
	snapshot: function() {
		return {
			name: this.name,
			voice: this.voice,
			mood: this.mood.snapshot(),
			body: this.body.snapshot()
		}
	},
	orientation: function(o) {
		if (!isNaN(o))
			this.body.springs.orientation.target = o;
		else
			return this.body.springs.orientation.target;
	},
	direction: function(direction) {
		var thing = this.body;
		if (this.isYou() && camera.isPolar)
			thing = thing.polar.directors;
		return thing[direction || "front"].getDirection();
	},
	isYou: function() {
		return this == zero.core.current.person;
	},
	_dance: function() {
		if (!this.body || !this.activeDance)
			return;
		var dance = this.opts.dances[this.activeDance];
		dance.step = (dance.step + 1) % dance.steps.length;
		this.ungesture();
		this.gesture(dance.steps[dance.step]);
		(this.isYou() && CT.key.down("SPACE")) || this.sfx(this.activeDance);
//		this.dancer = setTimeout(this._dance, (dance.interval || 1000) / this.mood.opts.energy);
		this.dancer = setTimeout(this._dance, (dance.interval || 1000) * 2 / this.energy.k);
	},
	dance: function(dname, duration) {
		if (this.activeDance == dname) return;
		this.activeDance = dname;
		this.opts.dances[dname].step = -1;
		this._dance();
		duration && setTimeout(this.undance, duration);
	},
	undance: function() {
		this._.bouncer = 1;
		delete this.activeDance;
		if (this.dancer) {
			clearTimeout(this.dancer);
			delete this.dancer;
		}
		this.ungesture();
	},
	gesture: function(gname) {
		if (!this.body) return this.log("gesture() cancelled (no body)");
		if (gname == "ungesture")
			return this.ungesture();
		this.activeGesture = gname;
		this.body.move(this.opts.gestures[gname]);
	},
	ungesture: function(resetz, side, sub) {
		if (!this.body) return this.log("ungesture() cancelled (no body)");
		var gest = {}, neutral = this._.neutral;
		if (!resetz) {
			if (side || sub)
				resetz = neutral(side, sub);
			else if (this.activeGesture) {
				resetz = this.opts.gestures[this.activeGesture];
				delete this.activeGesture;
			} else
				resetz = neutral(side, sub);
		}
		zero.core.util.mergeBit(resetz, gest);
		this.body.move(gest);
	},
	mod: function(mname) {
		this.activeMod = mname;
		this.body.resize(this.opts.mods[mname]);
	},
	unmod: function(resetz, side, sub) {
		var gest = {}, neutral = this._.neutral;
		if (!resetz) {
			if (side || sub)
				resetz = neutral(side, sub, 1);
			else if (this.activeMod) {
				resetz = this.opts.mods[this.activeMod];
				delete this.activeMod;
			} else
				resetz = neutral(side, sub, 1);
		}
		zero.core.util.mergeBit(resetz, gest, 1);
		this.body.resize(gest);
	},
	setAura: function(aname) {
		this.curAura && this.ungear(this.curAura);
		this.curAura = "procedural.worn_aura." + aname;
		this.gear({ worn: { aura: this.curAura } });
	},
	gear: function(gear) {
		this.body.gear(gear);
	},
	ungear: function(gkey, side, sub) {
		this.body.ungear(gkey, side); // sub? side where?
	},
	hold: function(key, side) {
		var gobj = this.opts.gear,
			hobj = gobj.held = gobj.held || {};
		hobj[side] = key;
		this.gear(gobj);
	},
	unhold: function(side) {
		var hobj = this.opts.gear.held;
		this.ungear(hobj[side], side);
		delete hobj[side];
	},
	holster: function(key, area, side) {
		this.opts.bag[area][side] = key;
		this.body.bag(key, area, side);
	},
	unholster: function(area, side) {
		delete this.opts.bag[area][side];
		this.body.unbag(area, side);
	},
	bag: function(bopts) {
		var area, side;
		for (area in bopts)
			for (side in bopts[area])
				this.body.bag(bopts[area][side], area, side);
	},
	bagged: function(area, side, keyOnly) {
		var bag = (keyOnly ? this.opts.bag : this.body.bagged)[area];
		return side ? bag[side] : bag;
	},
	remove: function() {
		if (this.body.removed) return this.log("already removed!");
		var thaz = this;
		this.body.remove();
		["body", "brain", "energy", "vibe"].forEach(function(prop) {
			delete thaz[prop];
		});
		delete zero.core.current.people[this.name];
	},
	components: function(ownedOnly) {
		var cz = [{
			identifier: "Person: " + this.name,
			owners: this.opts.owners
		}].concat(this.opts.basepacks).concat(zero.core.util.components(this.body.opts,
			this.name + "'s body"));
		return ownedOnly ? cz.filter(comp => comp && comp.owners) : cz;
	},
	init: function(opts) {
		this.log("init", opts.name);
		var thiz = this, cfg = core.config.ctzero;
		this.opts = opts = CT.merge(opts, {
			moody: true,
			mood: {},
			vibe: {},
			mods: {},
			dances: {},
			grippy: true,
			verbose: false, // for audio log()s
			gestures: {},
			responses: {},
			positioners: {},
			voice: "Joanna"
		});
		this.opts.gestures = CT.merge(this.opts.gestures, zero.base.body.gestures);
		this.opts.dances = CT.merge(this.opts.dances, zero.base.body.dances);
		this.onresolved = opts.onresolved;
		if (cfg.brain.responses.unintelligible && !("unintelligible" in opts.responses)) {
			opts.responses.unintelligible = cfg.brain.responses.unintelligible;
			zero.core.rec.onfail(function(cb) {
				thiz.respond("unintelligible", function() {
					zero.core.rec.listen(cb);
				});
			});
		}
		this.grippy = opts.grippy;
		this.voice = opts.voice;
		this.name = opts.name;
		this.body = new zero.core.Body(CT.merge(opts.body, {
			onbuild: function(bod) {
				thiz.head = bod.head;
				bod.person = thiz.head.person = thiz;
				thiz.thruster = new zero.core.Thruster({ body: bod });
				if (zero.core.current.room)
					thiz.setFriction();
				if (opts.mods.default)
					thiz.mod("default");
				for (var p in opts.positioners)
					bod.springs[p].target = bod.springs[p].value = opts.positioners[p];
				opts.gear && thiz.gear(opts.gear);
				opts.bag && thiz.bag(opts.bag);
				opts.onbuild && opts.onbuild(thiz);
				cfg.gravity && bod.setBob();
			}
		}));
		this.brain = new zero.core.Brain({
			person: this
		});
		this.energy = new zero.core.Energy(opts.energy);
		this.mood = new zero.core.Mood(CT.merge(opts.mood, {
			person: this
		}));
		this.vibe = new zero.core.Vibe({
			person: this,
			vibes: CT.merge(opts.vibe, {
				"default": this.mood.snapshot()
			})
		});
		this.prosody = CT.merge(opts.prosody, {
			rate: "medium",
			pitch: "medium"
		});
		this._.initSpeech();
		this._.sfx = zero.core.Person.audio;
		zero.core.camera.register(this.name, this.watch);
	}
});