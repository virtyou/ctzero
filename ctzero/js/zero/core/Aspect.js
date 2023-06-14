zero.core.Aspect = CT.Class({
	CLASSNAME: "zero.core.Aspect",
	tick: function() {
		var parent = this.parent, bod = parent.body, head = bod && bod.head;
		this.value = this.base;
		for (var s in this.springs)
			this.value += parent.springs[s].value * this.springs[s];
		for (var a in this.aspects)
			this.value += parent.aspects[a].value * this.aspects[a];
		for (var s in this.waves)
			this.value += bod.wave(s, this.waves[s].segs, this.waves[s].amp);
		for (var s in this.bsprings)
			this.value += bod.springs[s].value * this.bsprings[s];
		for (var s in this.hsprings)
			this.value += head.springs[s].value * this.hsprings[s];
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
			hsprings: {},
			waves: {}
		});
		this.max = opts.max;
		this.min = opts.min;
		this.name = opts.name;
		this.value = this.base = opts.base;
		this.parent = opts.parent;
		this.aspects = opts.aspects;
		this.springs = opts.springs;
		this.bsprings = opts.bsprings;
		this.hsprings = opts.hsprings;
		this.unbounded = opts.unbounded;
		this.waves = opts.waves;
	}
});

var aspect = zero.core.aspectController = new zero.core.Controller({
	abstraction: zero.core.Aspect
});