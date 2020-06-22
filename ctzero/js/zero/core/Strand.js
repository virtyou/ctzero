zero.core.Strand = CT.Class({
	CLASSNAME: "zero.core.Strand",
	segment: function(index) {
		var oz = this.opts, len = oz.length,
			ypos = index ? len : oz.yoff, t = oz.taper;
		return {
			matcat: "Basic",
			name: "seg" + index,
			position: [0, ypos, 0],
			scale: [t, 1, t],
			boxGeometry: [oz.girth, len, oz.girth],
			material: { color: oz.color }
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
			pend.boost = (pend.boost + (vel[dim] + vel.y) / vd) * oz.drag;
			pend.acceleration = dts * Math.sin(rot[dim]) / damp;
			seg.adjust("rotation", dim, pend.value);
		});
	},
	tick: function(dts, vel) {
		this.dts = dts;
		this.vel = vel;
		this.segs.forEach(this.tickSegment);
	},
	setColor: function(col) {
		for (var seg of this.segs)
			seg.setColor(col);
	},
	setTexture: function(tx) {
		for (var seg of this.segs)
			seg.setTexture(tx);
	},
	setSprings: function() {
		var oz = this.opts, pz = this.pends = {
			x: [], z: []
		}, thaz = this, i, f, k;
		["x", "z"].forEach(function(dim) {
			for (i = 0; i < oz.segments; i++) {
				f = oz.flex;// * (oz.segments - i) / oz.segments;
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
			taper: 0.8,
			length: 6,
			girth: 3,
			yoff: 9,
			segments: 8,
			drag: 0.7,
			damp: 1.4,
			veldamp: 6000,
			color: 0x000000,
			flex: Math.PI * 2 / 3
		});
		this.segs = [];
		this.setSprings();
	}
}, zero.core.Thing);