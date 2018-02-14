var moodMaster_k = 1; // 4; // 2; //1
var moodMaster_damp = 1; // 2; // 2;  // 1
var moodMaster_magnitude = 1;
// TODO: Mood Master!! (zero.core.Mood)

zero.core.Spring = CT.Class({
	CLASSNAME: "zero.core.Spring",
	tick: function(dts) {
		this.target += this.boost;
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
		this.opts = opts = CT.merge(opts, {
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
		this.breaks = opts.breaks;
		this.target =  opts.target;
		this.velocity = opts.velocity;
	}
});

var spring = zero.core.springController = new zero.core.Controller({
	abstraction: zero.core.Spring
});