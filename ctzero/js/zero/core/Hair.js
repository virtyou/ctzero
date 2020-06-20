zero.core.Hair = CT.Class({
	CLASSNAME: "zero.core.Hair",
	preassemble: function() {
		var oz = this.opts, r = oz.range,
			space = r * 2 / oz.density,
			pz = oz.parts, i = 0,
			shift = oz.shift, x, z,
			offx = oz.offx, offz = oz.offz;
		for (x = -r + offx; x <= r + offx; x += space) {
			for (z = -r + offz; z <= r + offz; z += space) {
				pz.push(CT.merge(oz.hair, {
					thing: "Strand",
					name: "strand" + i,
					rotation: [x, 0, z]
				}));
				i += 1;
			}
		}
		this.count = i;
	},
	tick: function(dts) {
		for (var i = 0; i < this.count; i++)
			this["strand" + i].tick(dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 12,
			range: Math.PI / 2,
			offx: -Math.PI / 4,
			offz: 0,
			position: [0, 6, 0]
		}, this.opts);
	}
}, zero.core.Thing);