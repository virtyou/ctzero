zero.core.hair.Strand = CT.Class({
	CLASSNAME: "zero.core.hair.Strand",
	_cols: [0xff0000, 0x00ff00, 0x0000ff],
	segment: function(index) {
		var oz = this.opts;
		return {
			name: "seg" + index,
			position: [0, oz.length, 0],
			boxGeometry: [oz.girth, oz.length, oz.girth],
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
		var pend = this.pends.x[i];
		pend.boost -= this.vel.x; // TODO: z
		pend.acceleration = Math.sin(seg.rotation(null, true).x);
		seg.adjust("rotation", "x", pend.value);
	},
	tick: function() {
		var pos = this.position(null, true);
		if (this.pos) {
			this.vel = zero.core.util.vector(this.pos, pos);
			this.segs.forEach(this.tickSegment);
		}
		this.pos = pos;
	},
	setSprings: function() {
		var i, oz = this.opts, pz = this.pends = { x: [] };
		for (i = 0; i < oz.segments; i++) { // TODO: z
			pz.x.push(zero.core.springController.add({
				hard: true,
				bounds: {
					min: -oz.stiffness,
					max: oz.stiffness
				}
			}, "x" + i, this));
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			length: 5,
			girth: 1,
			segments: 3,
			stiffness: 1 // lower is higher
		});
		this.segs = [];
		this.setSprings();
	}
}, zero.core.Thing);