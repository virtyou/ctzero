zero.core.Controller = CT.Class({
	CLASSNAME: "zero.core.Controller",
	_: {
		collection: {}
	},
	tick: function(dts) {
		var c = this._.collection;
		for (var n in c) {
			for (var i = 0; i < c[n].length; i++)
				c[n][i].tick(dts);
		}
	},
	update: function(name, opts, index) {
		var k, c = this._.collection[name];
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
			return this._.collection[name][index];
		return this._.collection[name];
	},
	add: function(opts, name, parent) {
		if (this.opts.abstraction) {
			opts.name = name || opts.name;
			opts.parent = parent;
			var a = new this.opts.abstraction(opts);
		} else
			var a = this.opts.initializer(opts, name, parent);
		if (!this._.collection[opts.name])
			this._.collection[opts.name] = [];
		this._.collection[opts.name].push(a);
		return a;
	},
	remove: function(name, index) {
		var c = this._.collection[name];
		if (typeof index == "number") {
			c[index].stop();
			CT.data.remove(c, index);
		} else {
			for (var i = 0; i < c.length; i++)
				c[i].stop();
			c.length = 0;
		}
	},
	init: function(opts) {
		this.opts = opts; // abstraction or initializer
	}
});