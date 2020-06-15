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
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			length: 5,
			girth: 1,
			segments: 3
		});
	}
}, zero.core.Thing);