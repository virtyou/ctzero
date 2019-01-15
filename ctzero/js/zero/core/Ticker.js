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
	reschedule: function(opts) {
		var reschedule = opts.reschedule || {},
			base = reschedule.base || 1,
			coefficient = reschedule.coefficient || 0;
		this.stop();
		this._timeout = setTimeout(this.tick,
			(base + coefficient * Math.random()) * 1000);
	},
	tick: function() {
		var condition, direction, opts, s, up = this._up;
		for (condition in this.conditions) {
			direction = this.parent[condition] ? "yes" : "no";
			opts = this.conditions[condition][direction];
			this.reschedule(opts);
			if (opts.once) {
				if (this.oncers[direction])
					continue;
				for (s in this.oncers) // will be at most one
					delete this.oncers[s];
				this.oncers[direction] = true;
			}
			s = this.parent.springs[this.name];
			["target", "k", "damp"].forEach(function(property) {
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

var ticker = zero.core.tickerController = new zero.core.Controller({
	initializer: function(opts, name, parent) {
		return new zero.core.Ticker({
			name: name,
			parent: parent,
			conditions: opts
		});
	}
});