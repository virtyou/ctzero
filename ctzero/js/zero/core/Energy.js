zero.core.Energy = CT.Class({
	CLASSNAME: "zero.core.Energy",
	init: function(opts) {
		this.opts = opts;
		this.k = opts.k;
		this.damp = opts.damp;
	}
});