zero.core.Spring = CT.Class({
	CLASSNAME: "zero.core.Spring",
	tick: function(dts) {
		var mood = this.parent && this.parent.energy && this.parent.energy();
		if (mood) {
			var moodMaster_damp = mood.damp,
				moodMaster_k = mood.k;
		} else {
			var moodMaster_damp = 1,
				moodMaster_k = 1;
		}
		this.target += this.boost;
		if (this.bounds) {
			if (this.bounds.max)
				this.target = Math.min(this.target, this.bounds.max);
			if (this.bounds.min)
				this.target = Math.max(this.target, this.bounds.min);
		}
		this.value += this.velocity * dts;
		this.velocity += (this.k * moodMaster_k * (this.target - this.value)
			- this.damp * moodMaster_damp * this.velocity) * dts;
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
			breaks: false
		});
		this.k = opts.k;
		this.name = opts.name;
		this.damp = opts.damp;
		this.boost = opts.boost;
		this.value = opts.value;
		this.parent = opts.parent;
		this.breaks = opts.breaks;
		this.target =  opts.target;
		this.velocity = opts.velocity;
		this.bounds = opts.bounds;
	}
});

var spring = zero.core.springController = new zero.core.Controller({
	abstraction: zero.core.Spring
});