zero.core.Tail = CT.Class({
	CLASSNAME: "zero.core.Tail",
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			offx: -Math.PI,
			position: [0, 0, -8]
		}, this.opts);
		opts.strand = CT.merge(opts.strand, {
			yoff: Math.PI,
			damp: 3,
			hard: false
		});
	}
}, zero.core.Hair);