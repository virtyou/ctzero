zero.core.Hair = CT.Class({
	CLASSNAME: "zero.core.Hair",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.count; i++) {
			pz.push({
				thing: "Strand",
				name: "strand" + i,
				girth: oz.girth,
				length: oz.length,
				segments: oz.segments,
				stiffness: oz.stiffness,
				position: [oz.space * i, 0, 0]
			});
		}
	},
	tick: function(dts) {
		for (var i = 0; i < this.opts.count; i++)
			this["strand" + i].tick(dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			girth: 1,
			space: 5,
			count: 5,
			length: 5,
			segments: 9,
			stiffness: 1 // lower is higher
		});
		this.hairs = [];
	}
}, zero.core.Thing);