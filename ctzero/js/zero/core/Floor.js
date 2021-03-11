zero.core.Floor = CT.Class({
	CLASSNAME: "zero.core.Floor",
	setPull: function(pull, axis) {
		var zccp = zero.core.current.people;
		this.pull.slide = this.pull.weave = 0;
		if (axis)
			this.pull[axis] = pull;
		for (var p in zccp) {
			var b = zccp[p].body;
			if (b.upon == this)
				for (var s in this.pull)
					b.springs[s].pull = this.pull[s];
		}
	},
	getTop: function() {
		return this.group.position.y;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			repeat: [1, 1],
			rotation: [6.28/4, 0, 0]
		}, this.opts);
		if (opts.moshy)
			this.grippy = opts.grippy = false;
	}
}, zero.core.Thing);