zero.core.Person = CT.Class({
	CLASSNAME: "zero.core.Person",
	_: {
		step: -1,
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
			if (!this.brain)
				return this.log("can't chain - brainless!");
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
		var zcc = zero.core.current, r = zcc.room, vol = 1,
			curper = zcc.person, upon = this.body.upon, afiles,
			stepper = upon && upon.opts.stepper || r.opts.stepper;
		if (sound == "walk" && stepper)
			sound = stepper;
		afiles = this._.sfx && this._.sfx[sound];
		if (!afiles) return;
		if (curper && this.body && this != curper)
			vol = zero.core.util.close2u(this.body);
		this.opts.verbose && this.log("playing", sound, "at", vol);
		zero.core.audio.sfx(CT.data.choice(afiles), vol);
	},
	click: function() {
		this.body.group.__click && this.body.group.__click();
	},
	setVolume: function(v) {
		this._.audio.volume = Math.max(0.4, v);
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
	upon: function() {
		return this.body.upon ? this.body.upon.name : "bottom";
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
	sayone: function(phrases, cb, watch) {
		this.say(CT.data.choice(phrases), cb, watch);
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
	engage: function() {
		var rez = this.respond;
		rez("hello");
		CT.modal.choice({
			prompt: "talk or type?",
			data: ["talk", "type"],
			cb: function(pref) {
				if (pref == "talk")
					return zero.core.rec.listen(rez);
				CT.modal.prompt({
					prompt: "say what?",
					cb: rez
				});
			}
		});
	},
	tick: function(dts) {
		if (!this.head)
			return this.log("tick() w/o head!");
		this.opts.moody && this.mood.tick();
		this.body.tick(dts);
	},
	watch: function(nofollow, noroom) {
		var cam = zero.core.camera, cube = this.body.looker;
		cam.toggleCaret(!this.isYou());
		if (nofollow)
			cam.look(cube.position());
		else
			cam.follow(cube);
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
	orient: function(subject, spos, doafter, glopo) {
		var pos = this.body.placer.position;
		spos = spos || subject.position(null, glopo);
		this.orientation(Math.atan2(spos.x
			- pos.x, spos.z - pos.z));
		doafter && setTimeout(doafter, 500);
	},
	touch: function(subject, cb, arm, approached, handCb, force, glopo) {
		var zcu = zero.core.util, bod = this.body, bt = bod.torso, spy, contact = function() {
			cb && cb();
			handCb && handCb(bt.hands[arm], subject);
			bod.springs.bow.target = 0;
		}, shove = function() {
			bod.shove(zcu.vector(bt.hands[arm].position(null, true),
				subject.position(), true));
			setTimeout(contact, timeout);
		}, timeout = force ? 150 : 300;
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
		}, false, false, null, false, false, glopo);
	},
	held: function(side, handFallback) {
		var og = this.opts.gear, ikey = og.held && og.held[side];
		if (ikey)
			return zero.core.Thing.get(ikey);
		if (handFallback)
			return this.body.torso.hands[side];
	},
	holding: function(name, asitem) {
		var side, item;
		for (side of ["left", "right"]) {
			item = this.held(side);
			if (item && item.name == name)
				return asitem ? item : side;
		}
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
	drop: function(target, cb) {
		var dropper = zero.core.current.dropper, iopts,
			side = this.holding(target), item = this.held(side);
		if (!side)
			return this.say(CT.data.choice(["i don't have that", "i'm not holding that", "i don't have one"]));
		iopts = item.opts;
		this.unhold(side);
		dropper && dropper(this.body.position(), iopts.kind, iopts.variety, iopts.name);
		cb && cb();
	},
	get: function(target, cb) {
		if (typeof target == "string")
			target = zero.core.current.room[target];
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
		this.unchase();
		this.run();
		this.approach(subject, cb, false, true);
	},
	propel: function(direction, nopo) {
		var bs = this.body.springs, vec = this.direction(direction, nopo),
			booster = this.zombified ? 200 : 100;
		if (this.running)
			booster *= 2;
		bs.weave.boost = booster * vec.x;
		bs.slide.boost = booster * vec.z;
	},
	stop: function() {
		if (!this.body) return this.log("aborting stop() (no body)");
		var bs = this.body.springs;
		bs.weave.boost = bs.slide.boost = 0;
		this.undance();
	},
	obstruction: function(property) {
		var b = this.body, obs = b && b.obstructed,
			ob = obs.weave || obs.slide;
		if (ob)
			return property ? ob[property] : ob;
	},
	unchase: function() {
		var _ = this._;
		this.unrun();
		this.stop();
		if (_.chaser) {
			clearInterval(_.chaser);
			delete _.chaser;
			delete _.chased;
		}
	},
	chaser: function() {
		var _ = this._, cb = _.postchase, b = this.body;
		if (!b || b.removed || !_.chased || _.chased.removed)
			this.unchase();
		else if (zero.core.util.touching(b, _.chased, 20)) {
			this.unchase();
			cb && cb();
		} else if (this.obstruction())
			this.doLeap();
		else {
			this.orient(_.chased);
			this.propel(null, true);
		}
	},
	pursue: function(subject, cb) {
		var _ = this._;
		_.postchase = cb;
		_.chased = subject;
		_.chaser = setInterval(this.chaser, 500);
	},
	approach: function(subject, cb, watch, chase, dur, nobuff, jumpy, glopo) {
		var _ = this._, bod = this.body, zc = zero.core, dist,
			zcu = zc.util, zcc = zc.current, ppl = zcc.people,
			propel = this.propel, pursue = this.pursue, stop = this.stop,
			bso = bod.springs.orientation, bsohard = bso.hard, isYou = this.isYou();
		if (bod.lying) {
			setTimeout(this.approach, 300, subject, cb, watch, chase, dur, nobuff, jumpy);
			return this.stand();
		}
		if (typeof subject == "string") {
			if (subject == "player") {
				if (!zcc.person) return cb && cb();
				subject = zcc.person.body;
			} else if (ppl[subject])
				subject = ppl[subject].body;
			else
				subject = zcc.room[subject];
		}
		isYou && camera.angle("behind", null, null, true);
		watch && this.watch(false, true);
		bso.k = 200;
		bso.hard = false;
		this.orient(subject, null, function() {
			if (bod.removed)
				return CT.log("aborting approach - bod removed");
			propel(null, true);
			bso.k = 20;
			bso.hard = bsohard;
			if (chase)
				return pursue(subject, cb);
			if (!dur) {
				dist = zcu.distance(bod.position(), subject.position(null, glopo));
				if (!nobuff)
					dist -= zcu.buff(bod, subject);
				dur = dist * 10;
			}
			setTimeout(function() {
				stop();
				isYou && camera.angle("preferred");
				cb && cb();
			}, dur);
		}, glopo);
		this.go();
		if (!isYou && jumpy && this.obstruction())
			setTimeout(() => this.doLeap(false, null, 0.05), 300);
	},
	give: function(item, recipient, cb) {
		this.doer.give(item, recipient, cb);
	},
	light: function(lightable, cb) {
		this.doer.light(lightable, cb);
	},
	blow: function(horn, cb) {
		this.doer.blow(horn, cb);
	},
	ride: function(mount, cb, instant) {
		this.doer.ride(mount, cb, instant);
	},
	unride: function() {
		this.doer.unride();
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
		if (!this.body)
			return this.log("stopFlying() aborted - no body");
		this.body.landing = true;
		this.body.flying = false;
		this.dance("fall", 1000);
		setTimeout(() => this.gesture("upright"), 1600);
	},
	stand: function() {
		var bod = this.body;
		if (!(bod.lying || bod.sitting)) return;
		this.gesture("upright");
		bod.radSwap("stand");
		bod.lying && bod.adjust("position", "y", bod.radii.z, true);
		bod.lying = bod.sitting = false;
	},
	lie: function(bed, cb, instant) {
		this.doer.recline(bed, "lie", cb, instant);
	},
	sit: function(chair, cb, instant) {
		this.doer.recline(chair, "sit", cb, instant);
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
		bod.riding && this.unride();
		if (within) {
			if (within.opts.state == "liquid") {
				sound = "splash";
				this.splash();
				(t % 10) || bod.bubbletrail.release(1);
			} else if (within.opts.state == "plasma" && !within.quenched)
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
		var mount = this.body.riding;
		mount && mount.ambience("gallop");
	},
	unrun: function() {
		if (!this.body) return this.log("aborting unrun() (no body)");
		this.running = false;
		this.mood.reset("energy");
		this.energy.reset("damp");
		var mount = this.body.riding;
		mount && mount.ambience("walk");
	},
	setClimbing: function() {
		var bod = this.body, climbing = this.obstruction("climby"),
			spr = bod.springs.bob, cam = zero.core.camera;
		if (bod.climbing == climbing) return;
		bod.climbing = climbing;
		if (climbing) {
			spr.floored = false;
			spr.acceleration = 0;
			cam.angle("behind", null, null, true);
		} else {
			spr.acceleration = -1000;
			cam.angle("preferred");
		}
	},
	setCrawling: function() {
		var bod = this.body, crawling = zero.core.current.controls.crawling();
		if (bod.crawling == crawling) return;
		bod.crawling = crawling;
		if (crawling)
			bod.radSwap("crouch");
		else
			bod.radSwap("stand");
	},
	go: function(dur) {
		this.setCrawling();
		this.setClimbing();
		this._.bouncer = 1;
		this.stand();
		this.dance(this.body.curDance(), dur);
	},
	leave: function(portal, cb) {
		var me = this, zccr = zero.core.current.room;
		this.approach(portal, function() {
			zccr.eject(me, zccr[portal], true);
			cb && cb();
		}, true);
	},
	wander: function(where, cb, watch, dur) {
		this.lastWhere = where = where || "room";
		var r = zero.core.current.room, _ = this._, wantar = _.wantar = _.wantar || {},
			bz = (where == "room" || where == "bottom") ? r.bounds : r[where].bounds,
			min = bz.min, max = bz.max;
		wantar.weave = (min.x + CT.data.random(max.x - min.x, true)) * 0.9;
		wantar.slide = (min.z + CT.data.random(max.z - min.z, true)) * 0.9;
		this.move(wantar, cb, watch, dur);
	},
	move: function(opts, cb, watch, dur) {
		var gotar = this.body.gotar, gtp = gotar.group.position;
		gtp.x = opts.weave;
		gtp.z = opts.slide;
		gtp.y = opts.bob || this.body.placer.position.y;
		this.approach(gotar, cb, watch, false, dur, false, true);
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
	direction: function(direction, nopo) {
		var thing = this.body;
		if (this.isYou() && camera.isPolar && !nopo)
			thing = thing.polar.directors;
		return thing[direction || "front"].getDirection();
	},
	isYou: function() {
		return this == zero.core.current.person;
	},
	_dance: function() {
		if (!this.body || !this.activeDance)
			return;
		var _ = this._, dance = this.opts.dances[this.activeDance];
		_.step = (_.step + 1) % dance.steps.length;
		this.ungesture();
		this.gesture(dance.steps[_.step]);
		(this.isYou() && CT.key.down("SPACE")) || this.sfx(this.activeDance);
		this.dancer = setTimeout(this._dance, (dance.interval || 1000) * 2 / this.energy.k);
	},
	dance: function(dname, duration) {
		if (this.activeDance == dname) return;
		clearTimeout(this.dancer);
		this.activeDance = dname;
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
	select: function() {
		this.body.attach({
			name: "selector",
			torusGeometry: 20,
			torusTubeRadius: 3,
			position: [0, -80, 0],
			rotation: [Math.PI / 2, 0, 0],
			material: {
				color: 0xffdf00
			}
		});
	},
	unAura: function() {
		if (!this.curAura) return;
		this.ungear(this.curAura);
		delete this.curAura;
	},
	setAura: function(aname, timeout) {
		this.curAura && this.ungear(this.curAura);
		this.curAura = "procedural.worn_aura." + aname;
		this.gear({ worn: { aura: this.curAura } });
		timeout && setTimeout(this.unAura, timeout);
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
		if (!this.body || this.body.removed) return this.log("already removed!");
		var thaz = this;
		this.doer.stop();
		this.facer.stop();
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
	bodyBuilt: function(bod) {
		var opts = this.opts;
		this.head = bod.head;
		bod.person = this.head.person = this;
		this.thruster = new zero.core.Thruster({ body: bod });
		if (zero.core.current.room)
			this.setFriction();
		if (opts.mods.default)
			this.mod("default");
		for (var p in opts.positioners)
			bod.springs[p].target = bod.springs[p].value = opts.positioners[p];
		if (opts.positioners.bob)
			bod.springs.bob.floored = true;
		opts.gear && this.gear(opts.gear);
		opts.bag && this.bag(opts.bag);
		opts.onbuild && opts.onbuild(this);
		core.config.ctzero.gravity && zero.core.util.onRoomReady(bod.boundAndBob);
	},
	buildBody: function() {
		var opts = this.opts, pz = opts.positioners, oz = { onbuild: this.bodyBuilt };
		if (pz.bob)
			oz.position = [pz.weave, pz.bob, pz.slide];
		this.body = new zero.core.Body(CT.merge(opts.body, oz));
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
			autoface: true,
			gestures: {},
			responses: {},
			positioners: {},
			voice: "af_heart"
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
		this.buildBody();
		this.doer = new zero.core.Doer({
			person: this
		});
		this.facer = new zero.core.Facer({
			autoface: opts.autoface,
			person: this
		});
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