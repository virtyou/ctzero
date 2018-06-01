var rec = zero.core.rec = {
	_: {
		language: "english",
		record: function(stream) {
			var recorder = rec._.recorder = new MediaRecorder(stream);
			recorder.onstop = function() {
				stream.stop();
			};
			recorder.ondataavailable = function(data) {
				CT.net.formUp(data.data, {
					path: "/_zero",
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
		oops: function(err) {
			CT.log("oh no it didn't work!", err);
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
		var recognition = new webkitSpeechRecognition();
		recognition.onresult = function(event) { 
			cb(event.results[0][0].transcript);
		};
		recognition.start();
	},
	listen: function(cb) {
		if (window.webkitSpeechRecognition)
			return rec.local(cb);
		rec._.cb = cb;
		navigator.getUserMedia({ audio: true }, rec._.record, rec._.oops);
	}
};