zero.core.Strand = CT.Class({
	CLASSNAME: "zero.core.Strand",
	segment: function(index) {
		var oz = this.opts, len = oz.length,
			ypos = index ? len : oz.yoff;
		return {
			matcat: "Basic",
			thing: "Pendulum",
			name: "seg" + index,
			position: [0, ypos, 0],
			kink: oz.kink,
			curl: oz.curl,
			flex: oz.flex,
			drag: oz.drag,
			damp: oz.damp,
			veldamp: oz.veldamp,
			scale: oz.taper,
			texture: oz.texture,
			material: oz.material,
			boxGeometry: [oz.girth, len, oz.girth]
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
	tick: function(dts, vel) {
		this.segs.forEach(seg => seg.tick(dts, vel));
	},
	setColor: function(col) {
		for (var seg of this.segs)
			seg.setColor(col);
	},
	setTexture: function(tx) {
		for (var seg of this.segs)
			seg.setTexture(tx);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			kink: 0,
			length: 6,
			girth: 3,
			yoff: 6,
			segments: 8,
			drag: 0.7,
			damp: 1.4,
			curl: [0, 0],
			veldamp: 6000,
			flex: Math.PI * 2 / 3,
			taper: [0.8, 0.8, 0.8]
		});
		this.segs = [];
	}
}, zero.core.Thing);