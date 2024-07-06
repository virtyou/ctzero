zero.core.Brain = CT.Class({
	CLASSNAME: "zero.core.Brain",
	_: {
		said: [],
		fromList: function(resps) {
			var unsaid = resps.filter(r => !this._.said.includes(r));
			return CT.data.choice(unsaid.length ? unsaid : resps);
		},
		tsort: function(which) {
			var tz = Object.keys(which);
			tz.sort(function(a, b) { return b.length - a.length; });
			return tz;
		}
	},
	data2clip: function(data) {
		var opts = {
			url: URL.createObjectURL(zero.core.util.b64toBlob(data.audio, "audio/wav"))
		}, vis = opts.visemes = [];
		data.phonemes.forEach(function(pho, i) {
			vis.push({ value: pho, time: data.durations[i] / 10000 });
		});
		return opts;
	},
	say_data: function(data, cb) {
		this.person.afterSpeech(cb);
		return this.data2clip(data);
	},
	say: function(utterances, cb, playClip, prosody, voice) {
		if (!Array.isArray(utterances)) {
			if (!cb && !playClip && window.speechSynthesis)
				return speechSynthesis.speak(new SpeechSynthesisUtterance(utterances));
			utterances = [utterances];
		}
		var doNext = function() {
			var words = utterances.shift();
			if (!words)
				return cb && cb();
			CT.net.post({
				path: "/_speech",
				cb: playClip,
				params: {
					action: "say",
					words: words,
					voice: voice,
					prosody: prosody,
					language: /[A-Za-z0-9/$]/.test(words) && "english" || "mandarin"
				}
			});
		};
		this.person.afterSpeech(doNext);
		doNext();
	},
	listen: function(cb) {
		if (window.rec) return rec.listen(cb);
		var recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
		recognizer.onresult = function(event) {
			cb(event.results[0][0].transcript);
		};
		recognizer.start();
	},
	get_response: function(res) {
		var trigz = this.triggers, person = this.person;
		if (typeof res == "string")
			return res;
		if (typeof res == "function")
			return res(this.person);
		else if (Array.isArray(res))
			return this.get_response(this._.fromList(res));
		else if (typeof res == "object") {
			// these (audio, background, image, etc) look like {key,name,variety,item}

			// background changers
			res.map && zero.core.util.map(res.map.item);
			res.video && zero.core.util.video(res.video.item);
			res.iframe && zero.core.util.iframe(res.iframe.item);
			res.panorama && zero.core.util.panorama(res.panorama.item);
			res.background && zero.core.util.background(res.background.item);
			res.environment && zero.core.util.room(res.environment.item);

			// misc
			res.audio && zero.core.util.audio(res.audio.item);
			if (res.image) {
				var m = new CT.modal.Modal(CT.merge({
					content: CT.dom.img(res.image.item),
					onclick: function() {
						m.hide()
					}
				}, core.config.ctzero.brain.modal));
				m.show();
			}
			if (res.button) {
				var item = res.button.item, b = CT.dom.button(res.button.name, function() {
					person.respond(item.trigger);
				}, item.className), key, val;
				item.css.replace(/;/g, "").split("\n").forEach(function(rule) {
					[key, val] = rule.split(": ");
					b.style[key] = val;
				});
				CT.dom.addContent("ctmain", b);
			}

			// character
			res.vibe && person.vibe.update(res.vibe);
			res.mood && person.mood.update(res.mood);
			if (res.dance) {
				if (res.dance == "undance") // hacky...
					person.undance();
				else
					person.dance(res.dance);
			}
			res.gesture && person.gesture(res.gesture);
			if (res.mod) {
				if (res.mod == "unmod") // hacky...
					person.unmod();
				else
					person.mod(res.mod);
			}
			if (res.disable) {
				if (res.disable[0] == "untrigger") // hacky!!!
					trigz = this.triggers = {};
				else {
					res.disable.forEach(function(key) {
						delete trigz[key];
					});
				}
			}
			res.branches && Object.assign(trigz, res.branches);
			if (res.chain)
				this.chain = res.chain;
			res.cb && res.cb(trigz);
			return this.get_response(res.phrase);
		}
	},
	choose_response: function(rdata) {
		var resp = this.get_response(rdata);
		this._.said.push(resp);
		return resp;
	},
	respond: function(phrase, cb) {
		var respz = this.person.opts.responses,
			lphrase = phrase.toLowerCase(),
			sets = [this.triggers, respz],
			s, i, set, trig, tsorted;
		for (s = 0; s < sets.length; s++) {
			set = sets[s];
			tsorted = this._.tsort(set);
			for (i = 0; i < tsorted.length; i++) {
				trig = tsorted[i];
				if (lphrase.indexOf(trig) != -1)
					return cb(this.choose_response(set[trig]));
			}
		}
		if (phrase == "resolve" && this.person.onresolved)
			return cb(this.person.onresolved());
		var defresp = this.triggers["*"] || respz["*"];
		if (defresp) // default response object
			return cb(this.choose_response(defresp));
		if (core.config.ctzero.brain.noChat) return;
		var chopts = {
			action: "chat",
			question: phrase,
			name: this.person.name,
			mood: this.person.mood.snapshot()
		}, zcc = zero.core.current;
		if (zcc.person && zcc.person != this.person)
			chopts.asker = zcc.person.name;
		CT.net.post({
			path: "/_speech",
			params: CT.merge(chopts, this.person.opts.ai),
			cb: cb
		});
	},
	compare: function(target, next, onwrong) {
		target = target.text || target;
		document.getElementById(onwrong ? "iSaid" : "sayThis").innerHTML = target;
		var b = this;
		this.listen(function(result) {
			if (result.indexOf("\\") != -1)
				result = unescape(result.replace(/\\/g, "%"));
			if (onwrong)
				document.getElementById("sayThis").innerHTML = result;
			if (target == result) {
				b.person.setSmile(0.6);
				b.say(phrases.get("praise"), next);
			}
			else {
				b.person.setSmile(0);
				b.say(phrases.get("rebuke"), function() {
					b.person.setSmile(0.2);
					var sayz = [phrases.get("you_said"), result, phrases.get("try_this")];
					if (!onwrong)
						sayz.push(target);
					b.say(sayz, function() {
						if (onwrong)
							onwrong();
						else
							b.compare(target, next);
					}, false, diffString(result, target));
				});
			}
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			person: window,
			triggers: {}
		});
		this.person = opts.person;
		this.triggers = opts.triggers;
	}
});