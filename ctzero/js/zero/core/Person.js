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
		}
	},
	setVolume: function(v) {
		this._.audio.volume = v;
	},
	afterSpeech: function(cb) {
		this._.audio.onended = cb;
	},
	setSmile: function(degree, unsmile) {
		degree = degree || 0;
		var smiler = this.body.springs.bigSmile;
		this.log("setSmile", degree, unsmile);
		smiler.target = degree;
		unsmile && setTimeout(function() {
			smiler.target = 0;
		}, 5000);
	},
	say: function(data, cb, watch) {
		zero.core.rec.cancel();
		watch && this.watch();
		if (data.audio)
			this._.playClip(this.brain.say_data(data, cb));
		else {
			this.mood.tick();
			this.brain.say(data, cb, this._.playClip, this.prosody, this.voice);
		}
	},
	respond: function(phrase, cb) {
		var thaz = this;
		this.brain.respond(phrase, function(words) {
			words ? thaz.say(words, function() {
				thaz._.chain(cb);
			}) : thaz._.chain(cb);
		});
	},
	tick: function() {
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
					 pz[p].look(cube);
		}
	},
	look: function(subject, orient) {
		this.subject = subject;
		if (orient) {
			var pos = this.body.bone.position,
				spos = subject.position();
			this.body.springs.orientation.target = Math.atan2(
				spos.x - pos.x, spos.z - pos.z);
		}
	},
	approach: function(subject) {
		var bod = this.body, dance = this.dance,
			vec, geto = this.getOrientation;
		bod.springs.orientation.k = 200;
		this.look(subject, true);
		setTimeout(function() { // adapted from Controls.mover()... revise?
			dance("walk");
			vec = geto();
			bod.springs.orientation.k = 20;
			bod.springs.weave.boost = 2 * vec.x;
			bod.springs.slide.boost = 2 * vec.z;
		}, 500); // time for orientation...
	},
	snapshot: function() {
		return {
			name: this.name,
			voice: this.voice,
			mood: this.mood.snapshot(),
			body: this.body.snapshot()
		}
	},
	getOrientation: function() {
		return this.body.bones[0].getWorldDirection();
	},
	_dance: function() {
		if (!this.activeDance)
			return;
		var dance = this.opts.dances[this.activeDance];
		dance.step = (dance.step + 1) % dance.steps.length;
		this.ungesture();
		this.gesture(dance.steps[dance.step]);
		setTimeout(this._dance, dance.interval || 1000);
	},
	dance: function(dname) {
		if (this.activeDance == dname) return;
		this.activeDance = dname;
		this.opts.dances[dname].step = -1;
		this._dance();
	},
	undance: function() {
		delete this.activeDance;
		this.ungesture();
	},
	gesture: function(gname) {
		this.activeGesture = gname;
		this.body.move(this.opts.gestures[gname]);
	},
	ungesture: function(resetz, side, sub) {
		var gest = {}, zcu = zero.core.util;
		if (!resetz) {
			if (side || sub)
				resetz = zcu.neutral(side, sub);
			else if (this.activeGesture) {
				resetz = this.opts.gestures[this.activeGesture];
				delete this.activeGesture;
			} else
				resetz = zcu.neutral(side, sub);
		}
		zcu.mergeBit(resetz, gest);
		this.body.move(gest);
	},
	mod: function(mname) {
		this.activeMod = mname;
		this.body.resize(this.opts.mods[mname]);
	},
	unmod: function(resetz, side, sub) {
		var gest = {}, zcu = zero.core.util;
		if (!resetz) {
			if (side || sub)
				resetz = zcu.neutral(side, sub, 1);
			else if (this.activeMod) {
				resetz = this.opts.mods[this.activeMod];
				delete this.activeMod;
			} else
				resetz = zcu.neutral(side, sub, 1);
		}
		zcu.mergeBit(resetz, gest, 1);
		this.body.resize(gest);
	},
	remove: function() {
		var thaz = this;
		this.body.remove();
		["body", "brain", "energy", "vibe"].forEach(function(prop) {
			delete thaz[prop];
		});
		delete zero.core.current.people[this.name];
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
			gestures: {},
			responses: {},
			voice: "Joanna"
		});
		this.onresolved = opts.onresolved;
		if (cfg.brain.responses.unintelligible && !("unintelligible" in opts.responses)) {
			opts.responses.unintelligible = cfg.brain.responses.unintelligible;
			zero.core.rec.onfail(function(cb) {
				thiz.respond("unintelligible", function() {
					zero.core.rec.listen(cb);
				});
			});
		}
		this.voice = opts.voice;
		this.name = opts.name;
		this.body = new zero.core.Body(CT.merge(opts.body, {
			onbuild: function() {
				thiz.head = thiz.body.head;
				thiz.body.person = thiz.head.person = thiz;
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