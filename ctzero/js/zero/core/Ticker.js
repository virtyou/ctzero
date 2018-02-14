zero.core.Ticker = CT.Class({
	CLASSNAME: "Ticker",
	_up: function(s, opts, property) {
		property = property || "target";
		var propts = opts[property];
		if (propts) {
			s[property] = propts.base || 0;
			if (propts.coefficient)
				s[property] += propts.coefficient * Math.random(); 
		}
	},
	stop: function() {
		clearTimeout(this._timeout);
		delete this._timeout;
	},
	tick: function() {
		var condition, direction, opts, s, up = this._up;
		for (condition in this.conditions) {
			direction = this.parent[condition] ? "yes" : "no";
			opts = this.conditions[condition][direction];
			clearTimeout(this._timeout);
			this._timeout = setTimeout(this.tick, (opts.reschedule || 1) * 1000);
			if (opts.once) {
				if (this.oncers[direction])
					continue;
				for (s in this.oncers) // will be at most one
					delete this.oncers[s];
				this.oncers[direction] = true;
			}
			s = this.parent.springs[this.name];
			["target", "k"].forEach(function(property) {
				up(s, opts, property);
			});
			if (opts.boost) {
				for (s in opts.boost)
					up(this.parent.springs[s], opts.boost[s]);
			}
		}
	},
	init: function(opts) {
		this.opts = opts;
		this.name = opts.name;
		this.parent = opts.parent;
		this.conditions = opts.conditions;
		this.oncers = {};
		this.tick();
	}
});
var ticker = zero.core.tickerController = {
	_: {
		collection: {}
	},
	tick: function() {
		var c = ticker._.collection;
		for (var n in c) {
			for (var i = 0; i < c[n].length; i++)
				c[n][i].tick();
		}
	},
	get: function(name, index) {
		if (typeof index == "number")
			return ticker._.collection[name][index];
		return ticker._.collection[name];
	},
	add: function(opts, name, parent) {
		var t = new zero.core.Ticker({
			name: name,
			parent: parent,
			conditions: opts
		});
		if (!ticker._.collection[opts.name])
			ticker._.collection[opts.name] = [];
		ticker._.collection[opts.name].push(t);
		return t;
	},
	remove: function(name, index) {
		var c = ticker._.collection[name];
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