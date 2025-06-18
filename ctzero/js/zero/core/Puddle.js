zero.core.Puddle = CT.Class({
	CLASSNAME: "zero.core.Puddle",
	getTop: function() {
		return this.bounds.min.y;
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			vstrip: "templates.one.vstrip.water",
			stepper: "pud",
			grippy: false,
			halfSphere: 100,
			scale: [1, 0.05, 1],
			material: {
				shininess: 100,
				color: 0xaaccff
			}
		}, this.opts);
		this.grippy = opts.grippy;
	}
}, zero.core.Thing);