zero.core.Collection = CT.Class({
	CLASSNAME: "zero.core.Collection",
	kinds: [],
	spacing: 50,
	member: "Thing",
	_rower: function(kind, strip, isrow) {
		var i, oz = this.opts, pz = oz.parts,
			spacing = this.spacing, width = oz[kind] * spacing,
			a = -width / 2, b = strip * spacing;
		if (isrow) {
			x = a;
			z = b;
		} else {
			z = a;
			x = b;
		}
		for (i = 0; i < oz[kind]; i++) {
			pz.push({
				thing: this.member,
				index: i,
				name: kind + i,
				kind: kind,
				position: [x, 0, z]
			});
			if (isrow)
				x += spacing;
			else
				z += spacing;
		}
	},
	row: function(kind, index) {
		this._rower(kind, index, true);
	},
	col: function(kind, index) {
		this._rower(kind, index);
	},
	random: function(kind) {
		var i, oz = this.opts, pz = oz.parts,
			bz = zero.core.current.room.bounds,
			xmin = bz.min.x, zmin = bz.min.z,
			xmax = bz.max.x, zmax = bz.max.z;
			xrange = xmax - xmin, zrange = zmax - zmin,
			xhalf = xrange / 2, zhalf = zrange / 2;
		for (i = 0; i < oz[kind]; i++) {
			pz.push({
				thing: this.member,
				index: i,
				name: kind + i,
				kind: kind,
				position: [CT.data.random(xrange) - xhalf,
					0, CT.data.random(zrange) - zhalf]
			});
		}
	},
	preassemble: function() {
		if (this.opts.mode == "rows")
			this.kinds.forEach(this.row);
		else if (this.opts.mode == "cols")
			this.kinds.forEach(this.col);
		else
			this.kinds.forEach(this.random);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			mode: "random", // |rows|cols
		}, this.counts, this.opts);
	}
}, zero.core.Thing);