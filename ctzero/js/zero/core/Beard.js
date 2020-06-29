zero.core.Beard = CT.Class({
	CLASSNAME: "zero.core.Beard",
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 3,
			offx: Math.PI,
			position: [0, 0, 8]
		}, this.opts);
		opts.strand = CT.merge(opts.strand, {
			yoff: Math.PI,
			damp: 3,
			hard: false
		});
	}
}, zero.core.Hair);