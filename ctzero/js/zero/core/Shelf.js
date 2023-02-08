zero.core.Shelf = CT.Class({
	CLASSNAME: "zero.core.Shelf",
	preassemble: function() {
		const oz = this.opts, pz = oz.parts,
			w = oz.width, d = oz.depth, l = oz.legs,
			wh = w / 2, dh = d / 2, ll = l.length, lw = l.width,
			sheight = (oz.levels - 1) * oz.spacing,
			bheight = (oz.back == "tall") ? (sheight + oz.spacing) : sheight,
			lfl = l.full ? (ll + sheight) : ll,
			llh = lfl / 2;
		pz.push({
			name: "leg1",
			kind: "leg",
			boxGeometry: [lw, lfl, lw],
			position: [wh, llh, dh]
		});
		pz.push({
			name: "leg2",
			kind: "leg",
			boxGeometry: [lw, lfl, lw],
			position: [wh, llh, -dh]
		});
		pz.push({
			name: "leg3",
			kind: "leg",
			boxGeometry: [lw, lfl, lw],
			position: [-wh, llh, dh]
		});
		pz.push({
			name: "leg4",
			kind: "leg",
			boxGeometry: [lw, lfl, lw],
			position: [-wh, llh, -dh]
		});
		if (oz.back) {
			pz.push({
				name: "back",
				kind: "side",
				boxGeometry: [w, bheight, 2],
				position: [0, ll + bheight / 2, -dh]
			});
		}
		if (oz.sides) {
			pz.push({
				name: "left",
				kind: "side",
				boxGeometry: [2, sheight, d],
				position: [-wh, ll + sheight / 2, 0]
			});
			pz.push({
				name: "right",
				kind: "side",
				boxGeometry: [2, sheight, d],
				position: [wh, ll + sheight / 2, 0]
			});
		}
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
			back: false, // |true|tall
			sides: false,
			items: [],
			legs: CT.merge(this.opts.legs, {
				width: 4,
				length: 100,
				full: true
			})
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

zero.core.Shelf.setter = "display";
zero.core.Shelf.Display = CT.Class({
	CLASSNAME: "zero.core.Shelf.Display",
}, zero.core.Collection);