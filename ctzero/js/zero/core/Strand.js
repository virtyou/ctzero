zero.core.Strand = CT.Class({
	CLASSNAME: "zero.core.Strand",
	_cols: [0xff0000, 0x00ff00, 0x0000ff],
	segment: function(index) {
		var oz = this.opts, len = oz.length,
			ypos = index ? len : oz.yoff, t = oz.taper;
		return {
			matcat: "Basic",
			name: "seg" + index,
			position: [0, ypos, 0],
			scale: [t, 1, t],
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
		var pendz = this.pends, oz = this.opts,
			damp = oz.damp, vd = oz.veldamp,
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
		}, thaz = this, i, f, k;
		["x", "z"].forEach(function(dim) {
			for (i = 0; i < oz.segments; i++) {
				f = oz.flex * (oz.segments - i) / oz.segments;
				k = oz.kink * Math.random() - oz.kink / 2;
				pz[dim].push(zero.core.springController.add({
					hard: true,
					bounds: {
						min: k - f,
						max: k + f
					}
				}, dim + i, thaz));
			}
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			kink: 0,
			taper: 1,
			length: 5,
			girth: 0.2,
			yoff: 10,
			segments: 3,
			damp: 200,
			veldamp: 2000,
			flex: Math.PI / 3
		});
		this.segs = [];
		this.setSprings();
	}
}, zero.core.Thing);