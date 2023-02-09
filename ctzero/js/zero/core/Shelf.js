zero.core.Shelf = CT.Class({
	CLASSNAME: "zero.core.Shelf",
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, tx = oz.texture,
			w = oz.width, d = oz.depth, l = oz.legs,
			wh = w / 2, dh = d / 2, ll = l.length, lw = l.width,
			sheight = (oz.levels - 1) * oz.spacing,
			bheight = (oz.back == "tall") ? (sheight + oz.spacing) : sheight,
			lfl = l.full ? (ll + sheight) : ll, llh = lfl / 2,
			fullheight = bheight + ll, voff = fullheight / 2,
			legy = llh - voff,
			backy = ll + bheight / 2 - voff,
			sidey = ll + sheight / 2 - voff;
		this.material = this.getMaterial();
		pz.push({
			name: "leg1",
			kind: "leg",
			matinstance: this.material,
			boxGeometry: [lw, lfl, lw],
			position: [wh, legy, dh]
		});
		pz.push({
			name: "leg2",
			kind: "leg",
			matinstance: this.material,
			boxGeometry: [lw, lfl, lw],
			position: [wh, legy, -dh]
		});
		pz.push({
			name: "leg3",
			kind: "leg",
			matinstance: this.material,
			boxGeometry: [lw, lfl, lw],
			position: [-wh, legy, dh]
		});
		pz.push({
			name: "leg4",
			kind: "leg",
			matinstance: this.material,
			boxGeometry: [lw, lfl, lw],
			position: [-wh, legy, -dh]
		});
		if (oz.back) {
			pz.push({
				name: "back",
				kind: "side",
				matinstance: this.material,
				boxGeometry: [w, bheight, 2],
				position: [0, backy, -dh]
			});
		}
		if (oz.sides) {
			pz.push({
				name: "left",
				kind: "side",
				matinstance: this.material,
				boxGeometry: [2, sheight, d],
				position: [-wh, sidey, 0]
			});
			pz.push({
				name: "right",
				kind: "side",
				matinstance: this.material,
				boxGeometry: [2, sheight, d],
				position: [wh, sidey, 0]
			});
		}
		for (let i = 0; i < oz.levels; i++) {
			pz.push({
				name: "level" + i,
				kind: "level",
				matinstance: this.material,
				boxGeometry: [w, oz.thickness, d],
				position: [0, ll + oz.spacing * i - voff, 0]
			});
		}
	},
	init: function(opts) {
		const bs = zero.base.carpentry[opts.variety];
		opts.legs = CT.merge(this.opts.legs, bs.legs, {
			width: 4,
			length: 40,
			full: true
		});
		this.opts = opts = CT.merge(opts, bs, {
			levels: 1,
			width: 40,
			depth: 40,
			spacing: 20,
			thickness: 4,
			back: false, // |true|tall
			sides: false
		}, this.opts);
	}
}, zero.core.Thing);