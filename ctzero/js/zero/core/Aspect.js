zero.core.Aspect = CT.Class({
	CLASSNAME: "zero.core.Aspect",
	tick: function() {
		this.value = this.base;
		for (var s in this.springs)
			this.value += spring.get(s).value * this.springs[s];
		for (var a in this.aspects)
			this.value += aspect.get(a).value * this.aspects[a];
		this.value = Math.max(Math.min(this.value, this.max), this.min);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			max: 1,
			min: -1,
			base: 0,
			springs: {},
			aspects: {}
		});
		this.max = opts.max;
		this.min = opts.min;
		this.name = opts.name;
		this.value = this.base = opts.base;
		this.springs = opts.springs;
		this.aspects = opts.aspects;
	}
});
var aspect = zero.core.aspectController = {
	_: {
		collection: {}
	},
	tick: function(dts) {
		for (var s in aspect._.collection)
			aspect._.collection[s].tick(dts);
	},
	update: function(name, opts) {
		var k, s = aspect.get(name);
		for (k in opts)
			s[k] = opts[k];
	},
	get: function(name) {
		return aspect._.collection[name];
	},
	add: function(opts, name) {
		opts.name = name || opts.name;
		var a = new zero.core.Aspect(opts);
		aspect._.collection[opts.name] = a;
		return a;
	},
	remove: function(name) {
		delete aspect._.collection[name];
	}
};
