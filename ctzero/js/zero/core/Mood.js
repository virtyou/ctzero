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
			springs = this.person.body.springs,
			tickers = this.person.body.tickers;
		springs.brow.target = mad;
		springs.browAsym.target = antsy;
		springs.sad_brow.target = sad;
		springs.smile.target = springs.smileEyes.target =
			springs.bigSmile.target = happy;
		springs.nod.target = -0.1 * (sad - mad - antsy - (happy / 2));
		tickers.asym.conditions.talking.no.reschedule = 3 - antsy;
		tickers.lids.conditions.talking.no.reschedule = 5 - antsy * 2;
		tickers.tilt.conditions.talking.no.reschedule = 7 - antsy * 2;
		tickers.shake.conditions.talking.no.reschedule = 8 - antsy * 2;
		tickers.twist.conditions.talking.no.reschedule = 10 - antsy * 4;
		energy.k = 1 + happy + (2 * mad) - sad + antsy;
		prosody.rate = _.rates[Math.floor(2 - sad + antsy) % 5];
		prosody.pitch = _.pitches[Math.floor(energy.k) % 5];
	},
	update: function(opts) {
		this.opts = CT.merge(opts, this.opts);
	},
	snapshot: function() {
		return {
			mad: this.opts.mad,
			happy: this.opts.happy,
			sad: this.opts.sad,
			antsy: this.opts.antsy
		};
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