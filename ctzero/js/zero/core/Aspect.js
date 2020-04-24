zero.core.Aspect = CT.Class({
	CLASSNAME: "zero.core.Aspect",
	tick: function() {
		this.value = this.base;
		for (var s in this.springs)
			this.value += this.parent.springs[s].value * this.springs[s];
		for (var a in this.aspects)
			this.value += this.parent.aspects[a].value * this.aspects[a];
		if (Object.keys(this.bsprings).length) {
			var bod = this.parent.parent.body;
			if (bod) {
				for (var s in this.bsprings)
					this.value += bod.springs[s].value * this.bsprings[s];
			}
		}
		if (!this.unbounded)
			this.value = Math.max(Math.min(this.value, this.max), this.min);
	},
	shift: function(newbase) {
		var d = newbase - this.base;
		this.min += d;
		this.max += d;
		this.base = newbase;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			max: 1,
			min: -1,
			base: 0,
			aspects: {},
			springs: {},
			bsprings: {},
		});
		this.max = opts.max;
		this.min = opts.min;
		this.name = opts.name;
		this.value = this.base = opts.base;
		this.parent = opts.parent;
		this.aspects = opts.aspects;
		this.springs = opts.springs;
		this.bsprings = opts.bsprings;
		this.unbounded = opts.unbounded;
	}
});

var aspect = zero.core.aspectController = new zero.core.Controller({
	abstraction: zero.core.Aspect
});