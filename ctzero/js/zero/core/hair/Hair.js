zero.core.hair.Hair = CT.Class({
	CLASSNAME: "zero.core.hair.Hair",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.count; i++) {
			pz.push({
				thing: "hair.Strand",
				
			});
		}
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