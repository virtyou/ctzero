zero.core.Aspect = CT.Class({
	CLASSNAME: "zero.core.Aspect",
	tick: function() {
		this.value = this.base;
		for (var s in this.springs)
			this.value += this.parent.springs[s].value * this.springs[s];
		for (var a in this.aspects)
			this.value += this.parent.aspects[a].value * this.aspects[a];
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
		this.parent = opts.parent;
		this.springs = opts.springs;
		this.aspects = opts.aspects;
	}
});
var aspect = zero.core.aspectController = {
	_: {
		collection: {}
	},
	tick: function() {
		var c = aspect._.collection;
		for (var n in c) {
			for (var i = 0; i < c[n].length; i++)
				c[n][i].tick();
		}
	},
	update: function(name, opts, index) {
		var k, c = aspect._.collection[name];
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
			return aspect._.collection[name][index];
		return aspect._.collection[name];
	},
	add: function(opts, name, parent) {
		opts.name = name || opts.name;
		opts.parent = parent;
		var a = new zero.core.Aspect(opts);
		if (!aspect._.collection[opts.name])
			aspect._.collection[opts.name] = [];
		aspect._.collection[opts.name].push(a);
		return a;
	},
	remove: function(name, index) {
		var c = aspect._.collection[name];
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
