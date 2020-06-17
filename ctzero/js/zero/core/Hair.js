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
				stiffness: oz.stiffness
			});
		}
	},
	tick: function() {
		for (var i = 0; i < oz.count; i++)
			this["strand" + i].tick();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			girth: 1,
			count: 10,
			length: 5,
			segments: 3,
			stiffness: 1 // lower is higher
		});
		this.hairs = [];
	}
}, zero.core.Thing);