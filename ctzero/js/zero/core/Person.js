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
		    this.body.head.currentPhoneme = pho;
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
		else
			this.brain.say(data, cb, this._.playClip, this.prosody, this.voice);
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
	look: function(subject) {
		this.subject = subject;
	},
	snapshot: function() {
		return {
			name: this.name,
			voice: this.voice,
			mood: this.mood.snapshot(),
			body: this.body.snapshot()
		}
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
		this.body.torso.move(this.opts.gestures[gname]);
	},
	ungesture: function(resetz, side, sub) {
		var k, part, axis, gest = {}, mergeBit = function(obj1, obj2) {
			for (k in obj1) {
				if (typeof obj1[k] == "number")
					obj2[k] = 0;
				else {
					obj2[k] = {};
					mergeBit(obj1[k], obj2[k]);
				}
			}
		}, aspz = zero.base.aspects, genopts = function() {
			resetz = {};
			(side ? [side] : ["left", "right"]).forEach(function(side) {
				resetz[side] = {};
				(sub ? [sub] : ["arm", "hand"]).forEach(function(sub) {
					resetz[side][sub] = {};
					for (part in aspz[sub]) {
						resetz[side][sub][part] = {};
						for (axis in aspz[sub][part])
							resetz[side][sub][part][axis] = 0;
					}
				});
			});
		};
		if (!resetz) {
			if (side || sub)
				genopts();
			else if (this.activeGesture) {
				resetz = this.opts.gestures[this.activeGesture];
				delete this.activeGesture;
			} else
				genopts();
		}
		mergeBit(resetz, gest);
		this.body.torso.move(gest);
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
		var thiz = this;
		this.opts = opts = CT.merge(opts, {
			moody: true,
			mood: {},
			vibe: {},
			dances: {},
			gestures: {},
			responses: {},
			voice: "Joanna"
		});
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