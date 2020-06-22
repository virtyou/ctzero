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
	_pass: function(func, a1, a2) {
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
		var vel, dts = zero.core.util.dts,
			pos = this.position(null, true);
		this.pos && this._pass("tick", dts,
			zero.core.util.vector(this.pos, pos));
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
		this.isCustom = true; // for tick
	}
}, zero.core.Thing);