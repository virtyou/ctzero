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
		}
	},
	afterSpeech: function(cb) {
		this._.audio.onended = cb;
	},
	setSmile: function(degree, unsmile) {
		degree = degree || 0;
		var smiler = this.body.head.springs.bigSmile;
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
			this.brain.say(data, cb, this._.playClip);
	},
	respond: function(phrase, cb) {
		var thaz = this;
		this.brain.respond(phrase, function(words) {
			thaz.say(words);
			cb && cb();
		});
	},
	tick: function() {
		this.body.tick();
	},
	watch: function(nofollow, noroom) {
		var cube = this.body.looker;
		if (nofollow)
			zero.core.camera.look(cube.position());
		else
			zero.core.camera.follow(cube);
		if (!noroom) {
			var pz = zero.core.util.people;
			for (var p in pz)
				if (p != this.name)
					 pz[p].look(cube);
		}
	},
	look: function(subject) {
		this.subject = subject;
	},
	init: function(opts) {
		this.log("init", opts.name);
		var thiz = this;
		this.opts = opts;
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
		this.energy = new zero.core.Energy({
			k: 1,
			damp: 1
		});
		this._.initSpeech();
		zero.core.camera.register(this.name, this.watch);
	}
});