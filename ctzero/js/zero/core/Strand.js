zero.core.Strand = CT.Class({
	CLASSNAME: "zero.core.Strand",
	_cols: [0xff0000, 0x00ff00, 0x0000ff],
	segment: function(index) {
		var oz = this.opts, len = oz.length,
			ypos = index ? len : oz.yoff;
		return {
			name: "seg" + index,
			position: [0, ypos, 0],
			boxGeometry: [oz.girth, len, oz.girth],
			material: { color: this._cols[index % 3] }
		};
	},
	preassemble: function() {
		var i, seg, oz = this.opts, parts = oz.parts;
		for (i = 0; i < oz.segments; i++) {
			seg = this.segment(i);
			parts.push(seg);
			parts = seg.parts = [];
		}
	},
	assembled: function() {
		var i, part = this;
		for (i = 0; i < this.opts.segments; i++) {
			part = part["seg" + i];
			this.segs.push(part);
		}
		this._.built();
	},
	tickSegment: function(seg, i) {
		var pendz = this.pends, damp = 200, vd = 2000,
			rot = seg.rotation(null, true), pend,
			dts = this.dts, vel = this.vel;
		["x", "z"].forEach(function(dim) {
			pend = pendz[dim][i];
			pend.boost += vel[dim] / vd;
			pend.acceleration = dts * Math.sin(rot.x) / damp;
			seg.adjust("rotation", dim, pend.value);
		});
	},
	tick: function(dts) {
		var pos = this.position(null, true);
		if (this.pos) {
			this.dts = dts;
			this.vel = zero.core.util.vector(this.pos, pos);
			this.segs.forEach(this.tickSegment);
		}
		this.pos = pos;
	},
	setSprings: function() {
		var oz = this.opts, pz = this.pends = {
			x: [], z: []
		}, thaz = this, i, s;
		["x", "z"].forEach(function(dim) {
			for (i = 0; i < oz.segments; i++) {
				s = oz.stiffness * (oz.segments - i) / oz.segments;
				pz[dim].push(zero.core.springController.add({
					hard: true,
					bounds: {
						min: -s,
						max: s
					}
				}, dim + i, thaz));
			}
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			girth: 0.2,
			length: 5,
			yoff: 10,
			segments: 3,
			stiffness: Math.PI / 4 // lower is higher
		});
		this.segs = [];
		this.setSprings();
	}
}, zero.core.Thing);