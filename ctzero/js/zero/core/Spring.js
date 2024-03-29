zero.core.Spring = CT.Class({
	CLASSNAME: "zero.core.Spring",
	bound: function() {
		if (this.bounds) {
			if (this.bounds.max)
				this.target = Math.min(this.target, this.bounds.max);
			if (this.bounds.min)
				this.target = Math.max(this.target, this.bounds.min);
		}
		var zccr = zero.core.current.room;
		this.ebound && zccr && zccr.ebound(this, this.parent);
	},
	tick: function(dts, rdts) {
		if (this.noslow && zero.core.util.slow)
			return;
		if (this.rdts)
			dts = rdts;
		if (this.shove) {
			var sdts = this.shove * dts;
			this.target += sdts;
			this.value += sdts;
			this.shove /= 2;
			if (Math.abs(this.shove) < 0.1)
				this.shove = 0;
		}
		if (this.hard) {
			if (this.floored) return;
			this.target += this.boost * dts;
			if (this.pull)
				this.target += this.pull * dts;
			if (this.acceleration)
				this.boost += this.acceleration * dts;
			var ot = this.target;
			(this.boost || this.pull) && this.bound();
			if (this.acceleration && this.target != ot) { // floor...
				if (this.target == this.bounds.min && this.acceleration < 0 ||
					this.target == this.bounds.max && this.acceleration > 0) {
					if (this.floory) {
						this.floored = true;
						this.parent && this.parent.person && this.parent.person.land();
					}
					this.boost = 0;
				}
			}
			this.value = this.target; // for target trackers (including multi stuff)
			return;
		}
		var mood = this.parent && this.parent.energy && this.parent.energy();
		if (mood) {
			var moodMaster_damp = mood.damp,
				moodMaster_k = mood.k;
		} else {
			var moodMaster_damp = 1,
				moodMaster_k = 1;
		}
		this.target += this.boost * dts;
		var ot = this.target;
		this.bound();
		if (this.target != ot)
			this.boost = 0;
		this.value += this.velocity * dts;
		this.velocity += (this.acceleration || (this.k * moodMaster_k * (this.target
			- this.value) - this.damp * moodMaster_damp * this.velocity)) * dts;
		if (this.breaks) {
			if (this.velocity > 10 || this.velocity < -10)
				this.damp = 100;
			else
				this.damp = this.opts.damp;
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, { // also, parent
			k: 0,
			damp: 0,
			boost: 0,
			value: 0,
			target: 0,
			velocity: 0,
			rdts: false,
			hard: false,
			ebound: false,
			breaks: false,
			noslow: false,
			floory: false,
			floored: false,
			acceleration: 0
		});
		this.k = opts.k;
		this.rdts = opts.rdts;
		this.hard = opts.hard;
		this.name = opts.name;
		this.damp = opts.damp;
		this.boost = opts.boost;
		this.value = opts.value;
		this.parent = opts.parent;
		this.ebound = opts.ebound;
		this.breaks = opts.breaks;
		this.noslow = opts.noslow;
		this.bounds = opts.bounds;
		this.target =  opts.target;
		this.floory = opts.floory;
		this.floored = opts.floored;
		this.velocity = opts.velocity;
		this.acceleration = opts.acceleration;
	}
});

var spring = zero.core.springController = new zero.core.Controller({
	abstraction: zero.core.Spring
});