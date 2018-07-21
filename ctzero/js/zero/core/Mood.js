zero.core.Mood = CT.Class({
	CLASSNAME: "zero.core.Mood",
	_: {
		rates: ["x-slow", "slow", "medium", "fast", "x-fast"],
		pitches: ["x-low", "low", "medium", "high", "x-high"]
	},
	tick: function() {
		var opts = this.opts, _ = this._,
			happy = opts.happy, antsy = opts.antsy,
			mad = opts.mad, sad = opts.sad,
			prosody = this.person.prosody,
			energy = this.person.energy,
			springs = this.person.body.springs;
		springs.browAsym.target = mad;
		springs.smile.target = happy;
		springs.nod.target = -0.2 * (sad - mad - antsy - (happy / 2));
		energy.k = 1 + happy + (2 * mad) - sad + antsy;
		prosody.rate = _.rates[Math.floor(2 - sad + antsy) % 5];
		prosody.pitch = _.pitches[Math.floor(energy.k) % 5];
	},
	update: function(opts) {
		this.opts = CT.merge(opts, this.opts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			mad: 0,
			happy: 0,
			sad: 0,
			antsy: 0
		});
		this.person = opts.person;
	}
});