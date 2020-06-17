zero.core.Hair = CT.Class({
	CLASSNAME: "zero.core.Hair",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.count; i++) {
			pz.push(CT.merge(oz.hair, {
				thing: "Strand",
				name: "strand" + i,
				position: [oz.space * i, 0, 0]
			}));
		}
	},
	tick: function(dts) {
		for (var i = 0; i < this.opts.count; i++)
			this["strand" + i].tick(dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			space: 5,
			count: 5
		});
		this.hairs = [];
	}
}, zero.core.Thing);