zero.core.Energy = CT.Class({
	init: function(opts) {
		this.opts = opts;
		this.k = opts.k;
		this.damp = opts.damp;
	}
});