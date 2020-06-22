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
				pz.push(CT.merge(oz.strand, {
					thing: "Strand",
					name: "strand" + i,
					rotation: [x, 0, z]
				}));
				i += 1;
			}
		}
		this.count = i;
	},
	setColor: function(col) {
		for (var i = 0; i < this.count; i++)
			this["strand" + i].setColor(col);
	},
	tick: function(dts) {
		var i, vel, pos = this.position(null, true);
		if (this.pos) {
			vel = zero.core.util.vector(this.pos, pos);
			for (i = 0; i < this.count; i++)
				this["strand" + i].tick(dts, vel);
		}
		this.pos = pos;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 7,
			range: Math.PI * 2 / 5,
			offx: -Math.PI / 8,
			offz: 0,
			position: [0, 7, 4]
		}, this.opts);
	}
}, zero.core.Thing);