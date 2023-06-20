zero.core.Item = CT.Class({
	CLASSNAME: "zero.core.Item",
	varieties: ["knocker", "smasher", "grabber", "flamer"],
	init: function(opts) {
		this.opts = opts = CT.merge(zero.base.items[this.opts.name], opts, {
			variety: "knocker"
		}, this.opts);
		for (var v of this.varieties)
			this[v] = opts.variety == v;
	}
}, zero.core.Thing);