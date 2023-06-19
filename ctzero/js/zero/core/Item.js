zero.core.Item = CT.Class({
	CLASSNAME: "zero.core.Item",
	init: function(opts) {
		this.opts = opts = CT.merge(zero.base.items[this.opts.name], opts, {
			// what else?
		}, this.opts);
	}
}, zero.core.Thing);