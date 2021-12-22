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
	_pass: function(func, a1, a2, start, end) {
		start = start || 0;
		end = end || this.count;
		for (var i = start; i < end; i++)
			this["strand" + i][func](a1, a2);
	},
	setColor: function(col) {
		this._pass("setColor", col);
	},
	setTexture: function(tx) {
		this._pass("setTexture", tx);
	},
	tickBatch: function() {
		var zcu = zero.core.util, rate = zcu.tickRate(),
			max = Math.min(this.count, this.cur + parseInt(this.count * rate));
		this._pass("tick", zcu.dts, null, this.cur, max);
		this.cur = (max == this.count) ? 0 : max;
	},
	tick: function() {
		zero.core.util.shouldSkip() || this.tickBatch();
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
		this.cur = 0;
		this.isCustom = true; // for tick
	}
}, zero.core.Thing);