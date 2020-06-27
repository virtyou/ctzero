zero.core.Beard = CT.Class({
	CLASSNAME: "zero.core.Beard",
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 4,
			position: [0, -5, 8],
			offx: Math.PI * 2 /3
		}, this.opts);
		opts.strand = CT.merge(opts.strand, {
			yoff: 3
		});
	}
}, zero.core.Hair);