zero.core.Mood = CT.Class({
	CLASSNAME: "zero.core.Mood",
	tick: function() {
		var opts = this.opts, zcu = zero.core.util,
			happy = opts.happy, // smile, big smile, smile eyes, prosody
			mad = opts.mad,  // frown, snarl, brow, prosody
			sad = opts.sad,  // frown, sad brow
			ego = opts.ego,  // nod tick base
			rate = opts.rate,
			pitch = opts.pitch,
			energy = opts.energy, // antsiness, moodmaster_k, prosody_speed
			suspicion = opts.suspicion,   //   blink ticker base, smile eye ticker base
			curiosity = opts.curiosity,   //   tilt ticker_coeff
			prosody = this.person.prosody,
			energyMaster = this.person.energy,
			tickers = this.person.head.tickers,
			btickers = this.person.body.tickers;
		tickers.browSad.conditions.talking.no.target.coefficient = 2*sad - mad;
		tickers.browSad.conditions.talking.no.target.base = 0.5*(sad - 0.5*mad);
		tickers.browAsym.conditions.talking.no.target.coefficient = 1-sad;
		tickers.browAsym.conditions.talking.no.target.base = 0;
		tickers.asym.conditions.talking.no.target.coefficient = 1-sad;
		tickers.asym.conditions.talking.no.target.base = 0;
		tickers.brow.conditions.talking.no.target.coefficient = 1;
		tickers.brow.conditions.talking.no.target.base = 1.5*mad - 0.7*sad;
		tickers.frown.conditions.talking.no.target.coefficient = sad + mad - 0.5*happy;
		tickers.smile.conditions.talking.no.target.coefficient = happy - 0.5*mad - 0.5*sad;
		tickers.smile.conditions.talking.no.target.base = 0.3*happy;
		tickers.bigSmile.conditions.talking.no.target.coefficient = happy - 0.2*sad - 0.5*mad;
		tickers.bigSmile.conditions.talking.no.target.base = -0.2;
		btickers.nod.conditions.talking.no.target.coefficient = 0.2;
		btickers.nod.conditions.talking.no.target.base = -0.4*ego + 0.2;
		tickers.smileEyes.conditions.talking.no.target.coefficient = 0.2;
		//tickers.smileEyes.conditions.talking.no.target.base = -0.5 + suspicion;
		btickers.tilt.conditions.talking.no.reschedule.coefficient = 6 - 6*curiosity;
		btickers.tilt.conditions.talking.no.reschedule.base = 0;
		btickers.tilt.conditions.talking.no.target.coefficient = 0.4 + 0.5*curiosity;
		btickers.tilt.conditions.talking.no.target.base = -0.2 - 0.25*curiosity;
		btickers.tilt.conditions.talking.no.k.base = 2 + 20*energy; // 40+50*energy;
		//tickers.nod.conditions.talking.no.k.base = 2 + 20*energy;
		//tickers.shake.conditions.talking.no.k.base = 2 + 20*energy,
		energyMaster.set("k", 0.1 + 2 * energy);
//		energyMaster.k = 0.1 + 2 * energy;
//		energyMaster.damp = 0.1 + energyMaster.opts.damp / energy;
		prosody.rate = zcu.rates[Math.floor(4*rate) % 5];
		prosody.pitch = zcu.pitches[Math.floor(4*pitch) % 5];

		
		/*
			tickers.browSad.conditions.talking.no.target.coefficient = 0.3(1+sad);

		*/

	},
	tick_deprecated: function() {
		var opts = this.opts, zcu = zero.core.util,
			happy = opts.happy, antsy = opts.antsy,
			mad = opts.mad, sad = opts.sad,
			prosody = this.person.prosody,
			energy = this.person.energy,
			springs = this.person.body.springs,
			tickers = this.person.body.tickers;
		springs.brow.target = mad;
		springs.browAsym.target = antsy;
		springs.browSad.target = springs.frown.target = sad;
		springs.smile.target = springs.smileEyes.target =
			springs.bigSmile.target = happy;
		springs.nod.target = -0.1 * (sad - mad - antsy - (happy / 2));
		tickers.asym.conditions.talking.no.reschedule.base = 3 - antsy;
		tickers.lids.conditions.talking.no.reschedule.base = 5 - antsy * 2;
		tickers.tilt.conditions.talking.no.reschedule.base = 7 - antsy * 2;
		tickers.shake.conditions.talking.no.reschedule.base = 8 - antsy * 2;
		tickers.twist.conditions.talking.no.reschedule.base = 10 - antsy * 4;
		energy.k = Math.max(0.1, 1 + happy + (2 * mad) - sad + antsy);
		prosody.rate = zcu.rates[Math.floor(2 - sad + antsy) % 5];
		prosody.pitch = zcu.pitches[Math.floor(energy.k) % 5];
	},
	update: function(opts) {
		this.opts = CT.merge(opts, this.opts);
	},
	snapshot: function() {
		var s = CT.merge(this.opts);
		delete s.person;
		return s;
	},
	reset: function(mvec, mult) {
		this.opts[mvec] = (this.orig_opts[mvec] || 1) * (mult || 1);
	},
	init: function(opts) {
		this.orig_opts = opts;
		this.opts = opts = CT.merge(opts, zero.core.Mood.defaults);
		this.person = opts.person;
	}
});

zero.core.Mood.defaults = {
	mad: 0,
	happy: 0,
	sad: 0,
	ego: 0.5,
	pitch: 0.5,
	rate: 0.5,
	energy: 0.5,
	suspicion: 0.5,
	curiosity: 0.5
};
zero.core.Mood.vectors = Object.keys(zero.core.Mood.defaults);