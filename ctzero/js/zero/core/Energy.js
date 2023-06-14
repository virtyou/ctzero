zero.core.Energy = CT.Class({
	CLASSNAME: "zero.core.Energy",
	_: {
		mults: {}
	},
	getMult: function(variety) {
		return this._.mults[variety];
	},
	setMult: function(variety, val) {
		this._.mults[variety] = val;
	},
	set: function(prop, val) {
		this[prop] = val * this._.mults[prop];
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			k: 1,
			damp: 1,
			kMult: 1,
			dampMult: 1,
			targetMult: 1,
			reschedMult: 1
		});
		this.k = opts.k;
		this.damp = opts.damp;
		var mz = this._.mults;
		mz.k = opts.kMult;
		mz.damp = opts.dampMult;
		mz.target = opts.targetMult;
		mz.resched = opts.reschedMult;
	}
});