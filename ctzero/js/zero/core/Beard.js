zero.core.Beard = CT.Class({
	CLASSNAME: "zero.core.Beard",
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 3,
			position: [0, -5, 8],
			offx: Math.PI * 4 / 5
		}, this.opts);
		opts.strand = CT.merge(opts.strand, {
			yoff: 3,
			damp: 6,
			hard: false
		});
	}
}, zero.core.Hair);