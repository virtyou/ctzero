zero.core.Energy = CT.Class({
	CLASSNAME: "zero.core.Energy",
	init: function(opts) {
		this.opts = CT.merge(opts, {
			k: 1,
			damp: 1,
			targetMult: 1,
			reschedMult: 1
		});
		this.k = opts.k;
		this.damp = opts.damp;
		this.targetMult = opts.targetMult;
		this.reschedMult = opts.reschedMult;
	}
});