zero.core.Person = CT.Class({
	CLASSNAME: "zero.core.Person",
	_: {
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
		this.body.setFriction(this.grippy && zero.core.current.room.grippy);
	},
	onsay: function(cb) {
		this._.onsay = cb;
	},
	say: function(data, cb, watch) {
		zero.core.rec.cancel();
		watch && this.watch(false, true);
		if (data.audio)
			this._.playClip(this.brain.say_data(data, cb));
		else {
			this.mood.tick();
			this._.onsay && this._.onsay(data, this);
			this.brain.say(data, cb, this._.playClip, this.prosody, this.voice);
		}
	},
	respond: function(phrase, cb, watch) {
		var thaz = this, zcc = zero.core.current;
//		if (watch) { // watch both ways....
//			watch && this.watch(false, true);
//			if (zcc.person && zcc.person != this)
//				this.look(zcc.person.body, true);
//		}
		this.brain.respond(phrase, function(words) {
			words ? thaz.say(words, function() {
				thaz._.chain(cb);
			}) : thaz._.chain(cb);
		});
	},
	tick: function() {
		if (!this.head)
			return this.log("tick() w/o head!");
		this.opts.moody && this.mood.tick();
		this.body.tick();
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
	look: function(subject, orient) {
		this.subject = subject;
		orient && this.orient();
	},
	orient: function(subject) {
		var pos = this.body.group.position,
			spos = subject.position();
		this.orientation(Math.atan2(spos.x
			- pos.x, spos.z - pos.z));
	},
	touch: function(subject, cb, arm) {
		var bod = this.body, arms = bod.torso.arms, spy;
		this.approach(subject, function() {
			spy = subject.group.getWorldPosition().y;
			if (spy < bod.torso.legs.right.knee.getWorldPosition().y)
				bod.springs.bow.target = Math.PI / 4;
			else if (spy < bod.spine.pelvis.getWorldPosition().y)
				bod.springs.bow.target = Math.PI / 2;
			setTimeout(function() {
				arms[arm || "right"].point("shoulder", subject);
				cb && setTimeout(cb, 600);
			}, 600);
		});
	},
	get: function(subject, cb) {
		var g = this.opts.gear, h = g.held = g.held || {},
			side = "right", bod = this.body, gobj = {};
		if (h.right) {
			if (h.left)
				return this.say("i don't have any free hands");
			side = "left";
		}
		this.touch(subject, function() {
			gobj[side] = g.held[side] = subject.opts.key;
			bod.gear(gobj, true);
			zero.core.current.room.removeObject(subject);
			cb && cb();
		}, side);
	},
	approach: function(subject, cb, watch) {
		var bod = this.body, vec, getd = this.direction,
			dance = this.dance, undance = this.undance,
			zcc = zero.core.current, ppl = zcc.people,
			bso = bod.springs.orientation, bsohard = bso.hard;
		if (typeof subject == "string") {
			if (subject == "player") {
				if (!zcc.person) return cb && cb();
				subject = zcc.person.body;
			} else if (ppl[subject])
				subject = ppl[subject].body;
			else
				subject = zcc.room[subject];
		}
		watch && this.watch(false, true);
		bso.k = 200;
		bso.hard = false;
//		this.look(subject, true);
		this.orient(subject);
		setTimeout(function() { // adapted from Controls.mover()... revise?
			dance("walk");
			vec = getd();
			bso.k = 20;
			bso.hard = bsohard;
			bod.springs.weave.boost = 100 * vec.x;
			bod.springs.slide.boost = 100 * vec.z;
			var chkr = setInterval(function() {
				if (zero.core.util.touching(bod, subject, 40)) {
					bod.springs.weave.boost = 0;
					bod.springs.slide.boost = 0;
					clearInterval(chkr);
					undance();
					cb && cb();
				}
			}, 200);
		}, 500); // time for orientation...
	},
	move: function(opts, cb, watch) {
		var k, dur = 1000; // TODO: ACTUALLY CALC DUR!!!!
		for (var k in opts)
			this.body.springs[k].target = opts[k];
		watch && this.watch(false, true);
		this.dance("walk", dur);
		cb && setTimeout(cb, dur);
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
		if (o)
			this.body.springs.orientation.target = o;
		else
			return this.body.springs.orientation.target;
	},
	direction: function() {
		return this.body.bones[0].getWorldDirection();
	},
	_dance: function() {
		if (!this.activeDance)
			return;
		var dance = this.opts.dances[this.activeDance];
		dance.step = (dance.step + 1) % dance.steps.length;
		this.ungesture();
		this.gesture(dance.steps[dance.step]);
		setTimeout(this._dance, (dance.interval || 1000) / this.mood.opts.energy);
	},
	dance: function(dname, duration) {
		if (this.activeDance == dname) return;
		this.activeDance = dname;
		this.opts.dances[dname].step = -1;
		this._dance();
		duration && setTimeout(this.undance, duration);
	},
	undance: function() {
		delete this.activeDance;
		this.ungesture();
	},
	gesture: function(gname) {
		if (gname == "ungesture")
			return this.ungesture();
		this.activeGesture = gname;
		this.body.move(this.opts.gestures[gname]);
	},
	ungesture: function(resetz, side, sub) {
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
	gear: function(gear) {
		this.body.gear(gear);
	},
	ungear: function(gkey, side, sub) {
		this.body.ungear(gkey);
	},
	remove: function() {
		var thaz = this;
		this.body.remove();
		["body", "brain", "energy", "vibe"].forEach(function(prop) {
			delete thaz[prop];
		});
		delete zero.core.current.people[this.name];
	},
	components: function() {
		return [{
			identifier: "Person: " + this.name,
			owners: this.opts.owners
		}].concat(zero.core.util.components(this.body.opts, this.name + "'s body"));
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
				if (zero.core.current.room)
					thiz.setFriction();
				if (opts.mods.default)
					thiz.mod("default");
				for (var p in opts.positioners)
					bod.springs[p].target = bod.springs[p].value = opts.positioners[p];
				opts.gear && thiz.gear(opts.gear);
				opts.onbuild && opts.onbuild(thiz);
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
		zero.core.camera.register(this.name, this.watch);
	}
});