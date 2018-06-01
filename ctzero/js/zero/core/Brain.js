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
	say: function(utterances, cb, playClip) {
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
				path: "/_zero",
				cb: playClip,
				params: {
					action: "say",
					words: words,
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
			person: window
		});
		this.person = opts.person;
	}
});