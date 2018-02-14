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
var spring = zero.core.springController = {
	_: {
		collection: {}
	},
	tick: function(dts) {
		var c = spring._.collection;
		for (var n in c) {
			for (var i = 0; i < c[n].length; i++)
				c[n][i].tick(dts);
		}
	},
	update: function(name, opts, index) {
		var k, c = spring._.collection[name];
		if (typeof index == "number") {
			c = c[index];
			for (k in opts)
				c[k] = opts[k];
		} else {
			for (index = 0; index < c.length; index++) {
				for (k in opts)
					c[index][k] = opts[k];
			}
		}
	},
	get: function(name, index) {
		if (typeof index == "number")
			return spring._.collection[name][index];
		return spring._.collection[name];
	},
	add: function(opts, name, parent) {
		opts.name = name || opts.name;
		var s = new zero.core.Spring(opts);
		if (!spring._.collection[opts.name])
			spring._.collection[opts.name] = [];
		spring._.collection[opts.name].push(s);
		return s;
	},
	remove: function(name, index) {
		var c = spring._.collection[name];
		if (typeof index == "number") {
			c[index].stop();
			CT.data.remove(c, index);
		} else {
			for (var i = 0; i < c.length; i++)
				c[i].stop();
			c.length = 0;
		}
	}
};