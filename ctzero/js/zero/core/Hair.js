zero.core.Hair = CT.Class({
	CLASSNAME: "zero.core.Hair",
	preassemble: function() {
		var oz = this.opts, r = oz.range;
		if (!oz.density) {
			this.count = 0;
			return;
		}
		var space = r * 2 / oz.density,
			pz = oz.parts, c = oz.coverage,
			xr = r * c[0], zr = r * c[1],
			shift = oz.shift, i = 0, x, z,
			offx = oz.offx, offz = oz.offz;
		for (x = offx - xr; x <= offx + xr; x += space) {
			for (z = offz - zr; z <= offz + zr; z += space) {
				pz.push(CT.merge(oz.strand, {
					thing: "Strand",
					name: "strand" + i,
					rotation: [x, 0, z],
					texture: oz.texture,
					material: oz.material
				}));
				i += 1;
			}
		}
		this.count = i;
	},
	_pass: function(func, a1, a2) {
		var zcu = zero.core.util;
		if (zcu.dts == zcu.dmax)
			return this.log("low fps - skipping ticker:", this.name);
		for (var i = 0; i < this.count; i++)
			this["strand" + i][func](a1, a2);
	},
	setColor: function(col) {
		this._pass("setColor", col);
	},
	setTexture: function(tx) {
		this._pass("setTexture", tx);
	},
	tick: function() {
		this._pass("tick", zero.core.util.dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			density: 6,
			coverage: [1, 1],
			range: Math.PI * 2 / 5,
			offx: -Math.PI / 8,
			offz: 0,
			position: [0, 10, 4]
		}, this.opts);
		this.isCustom = true; // for tick
	}
}, zero.core.Thing);