zero.core.Brain = CT.Class({
	CLASSNAME: "zero.core.Brain",
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
		if (typeof res == "string")
			return res;
		if (typeof res == "function")
			return res(this.person);
		else if (Array.isArray(res))
			return this.get_response(CT.data.choice(res));
		else if (typeof res == "object") {
			// also support res.gesture{}, etc
			res.mood && this.person.mood.update(res.mood);
			res.branches && Object.assign(this.triggers, res.branches);
			return this.get_response(res.phrase);
		}
	},
	respond: function(phrase, cb) {
		var respz = this.person.opts.responses, i, word,
			words = phrase.toLowerCase().split(" ");
		for (i = 0; i < words.length; i++) {
			word = words[i];
			if (word in this.triggers)
				return cb(this.get_response(this.triggers[word]));
			if (word in respz)
				return cb(this.get_response(respz[word]));
		}
		if (respz["*"]) // default response object
			return cb(this.get_response(respz["*"]));
		CT.net.post({
			path: "/_speech",
			params: {
				action: "chat",
				question: phrase
			},
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