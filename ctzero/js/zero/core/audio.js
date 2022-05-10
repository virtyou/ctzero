zero.core.audio = {
	_: {
		auds: {},
		blobz: {},
		aud: function(sound, soft) {
			var _ = zero.core.audio._, auds = _.auds,
				aud = auds[sound];
			if (!aud)
				aud = auds[sound] = new Audio(sound);
			else if (!soft)
				aud.currentTime = 0;
			return aud;
		},
		amb: function(sound, shouldPlay) {
			var _ = zero.core.audio._, blobz = _.blobz,
				blob = blobz[sound], aud = new Audio(blob);
			if (!blob) {
				fetch(sound).then(resp => resp.blob()).then(function(braw) {
					aud.src = blobz[sound] = URL.createObjectURL(braw);
					shouldPlay && zero.core.util.playMedia(aud);
				});
			} else if (shouldPlay)
				zero.core.util.playMedia(aud);
			return aud;
		}
	},
	ambience: function(sound, volume, shouldPlay) {
		var aud = zero.core.audio._.amb(sound, shouldPlay);
		aud.volume = volume || 1;
		aud.loop = true;
		return aud;
	},
	sfx: function(sound, volume, soft) {
		var aud = zero.core.audio._.aud(sound, soft);
		aud.volume = volume || 1;
		aud.paused && zero.core.util.playMedia(aud, true);
	}
};