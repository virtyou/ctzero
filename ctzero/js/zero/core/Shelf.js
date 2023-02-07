zero.core.Shelf = CT.Class({
	CLASSNAME: "zero.core.Shelf",
	preassemble: function() {
		const oz = this.opts, pz = oz.parts,
			w = oz.width, d = oz.depth, l = oz.legs,
			wh = w / 2, dh = d / 2,
			ll = l.length, lw = l.width;
		pz.push({
			name: "leg1",
			kind: "leg",
			boxGeometry: [lw, ll, lw],
			position: [wh, ll / 2, dh]
		});
		pz.push({
			name: "leg2",
			kind: "leg",
			boxGeometry: [lw, ll, lw],
			position: [wh, ll / 2, -dh]
		});
		pz.push({
			name: "leg3",
			kind: "leg",
			boxGeometry: [lw, ll, lw],
			position: [-wh, ll / 2, dh]
		});
		pz.push({
			name: "leg4",
			kind: "leg",
			boxGeometry: [lw, ll, lw],
			position: [-wh, ll / 2, -dh]
		});
		for (let i = 0; i < oz.levels; i++) {
			pz.push({
				name: "level" + i,
				kind: "level",
				boxGeometry: [w, oz.thickness, d],
				position: [0, ll + oz.spacing * i, 0]
			});
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {

			position: [0, -100, 0], // FOR TESTING!!!!

			levels: 1,
			width: 100,
			depth: 100,
			spacing: 30,
			thickness: 4,
			back: false,
			sides: false,
			items: [],
			legs: {
				width: 4,
				length: 100
			}
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Bookshelf = CT.Class({
	CLASSNAME: "zero.core.Bookshelf",
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			books: []
		}, this.opts);
	}
}, zero.core.Shelf);