var rec = zero.core.rec = {
	_: {
		language: "english",
		indicator: null,
		tryLocal: !!window.webkitSpeechRecognition,

		// detectSilence adapted from https://jsfiddle.net/53watgqu/
		detectSilence: function(stream, onSoundEnd = _=>{}, onSoundStart = _=>{}, silence_delay = 500, min_decibels = -80) {
			const ctx = new AudioContext();
			const analyser = ctx.createAnalyser();
			const streamNode = ctx.createMediaStreamSource(stream);
			streamNode.connect(analyser);
			analyser.minDecibels = min_decibels;

			const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
			let silence_start = performance.now();
			let triggered = true; // trigger only once per silence event
			let hasSpoken = false; // skip onSoundEnd() on initial silence

			function loop(time) {
				analyser.getByteFrequencyData(data); // get current data
				if (data.some(v => v)) { // if there is data above the given db limit
					if(triggered) {
						hasSpoken = true;
						triggered = false;
						CT.log("speaking");
						onSoundStart();
					}
					silence_start = time; // set it to now
				}
				if (!triggered && time - silence_start > silence_delay) {
					triggered = true;
					CT.log("silent");
					if (hasSpoken) {
						onSoundEnd();
						return; // TODO: allow continuous...
					}
				}
				requestAnimationFrame(loop); // we'll loop every 60th of a second to check
			}
			loop();
		},

		record: function(stream) {
			rec.active = true;
			var recorder = rec._.recorder = new MediaRecorder(stream);
			recorder.onstop = function() {
				rec.active = false;
				stream.stop();
				rec.toggleIndicator();
			};
			recorder.ondataavailable = function(data) {
				CT.net.formUp(data.data, {
					path: "/_speech",
					params: {
						action: "rec",
						language: rec._.language
					},
					cb: rec._.cb,
					eb: rec._.oops(rec._.cb)
				});
			};
			rec._.detectSilence(stream, () => recorder.stop(), () => recorder.start());
		},
		oops: function(cb) {
			return function(err) {
				rec.active = false;
				rec.toggleIndicator();
				CT.log("oh no it didn't work!");
				CT.log(err);
				if (rec._.tryLocal) {
					CT.log("disabling local speech rec and retrying");
					rec._.tryLocal = false;
					rec.listen(cb);
				} else if (rec._.oops_cb)
					rec._.oops_cb(cb);
			};
		}
	},
	cancel: function() {
		if (rec._.recorder) {
			rec._.recorder.ondataavailable = null;
			clearTimeout(rec._.recorder.timeout);
			(rec._.recorder.state == "active") && rec._.recorder.stop();
			delete rec._.recorder;
		}
	},
	toggleIndicator: function() {
		rec._.indicator && CT.dom.showHideT(rec._.indicator);
	},
	setIndicator: function(node) {
		rec._.indicator = node;
	},
	setLanguage: function(lang) {
		if (!lang)
			rec._.norec = true;
		else
			rec._.language = lang;
	},
	local: function(cb, onerror) {
		rec.active = true;
		var recognition = new webkitSpeechRecognition();
		recognition.onresult = function(event) {
			rec.active = false;
			rec.toggleIndicator();
			cb(event.results[0][0].transcript);
		};
		recognition.onerror = onerror || rec._.oops(cb);
		recognition.start();
	},
	testLocal: function() {
		rec.local(function(words) {
			CT.log("success: " + words);
		}, function(err) {
			CT.log("error: " + JSON.stringify(err));
			rec.locErr = err;
		});
	},
	onfail: function(cb) {
		rec._.oops_cb = cb;
	},
	listen: function(cb, onfail) {
		if (onfail)
			zero.core.rec.onfail(onfail);
		rec.toggleIndicator();
		if (rec._.tryLocal)
			return rec.local(cb);
		rec._.cb = cb;
		navigator.mediaDevices.getUserMedia({ audio: true }).then(rec._.record)["catch"](rec._.oops(cb));
	}
};