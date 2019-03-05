var rec = zero.core.rec = {
	_: {
		language: "english",
		record: function(stream) {
			rec.active = true;
			var recorder = rec._.recorder = new MediaRecorder(stream);
			recorder.onstop = function() {
				rec.active = false;
				stream.stop();
			};
			recorder.ondataavailable = function(data) {
				CT.net.formUp(data.data, {
					path: "/_speech",
					params: {
						action: "rec",
						language: rec._.language
					},
					cb: rec._.cb
				});
			};
			recorder.start();
			recorder.timeout = setTimeout(function() { recorder.stop(); }, 3000);
		},
		oops: function(cb) {
			return function(err) {
				rec.active = false;
				if (rec._.oops_cb)
					rec._.oops_cb(cb);
				else {
					CT.log("oh no it didn't work!");
					CT.log(err);
				}
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
	setLanguage: function(lang) {
		if (!lang)
			rec._.norec = true;
		else
			rec._.language = lang;
	},
	local: function(cb) {
		rec.active = true;
		var recognition = new webkitSpeechRecognition();
		recognition.onresult = function(event) {
			rec.active = false;
			cb(event.results[0][0].transcript);
		};
		recognition.onerror = rec._.oops(cb);
		recognition.start();
	},
	onfail: function(cb) {
		rec._.oops_cb = cb;
	},
	listen: function(cb) {
		if (window.webkitSpeechRecognition)
			return rec.local(cb);
		rec._.cb = cb;
		navigator.mediaDevices.getUserMedia({ audio: true }).then(rec._.record)["catch"](rec._.oops(cb));
	}
};