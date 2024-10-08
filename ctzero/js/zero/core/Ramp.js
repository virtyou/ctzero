var P2 = Math.PI / 2, P4 = P2 / 2;

zero.core.Ramp = CT.Class({
	CLASSNAME: "zero.core.Ramp",
	_level: Math.PI / 2,
	getTop: function(pos) {
		var rx = this.group.rotation.x,
			level = this._level,
			bz = this.bounds,
			zmin = bz.min.z,
			zmax = bz.max.z,
			ymin = bz.min.y,
			ymax = bz.max.y;
		if (rx == level)
			return ymin;
		var zdif = zmax - zmin,
			ydif = ymax - ymin,
			zpos = pos.z - zmin,
			zper = zpos / zdif,
			yper = zper * ydif;
		return (rx > level) ? (ymax - yper) : (ymin + yper);
	},
	setSides: function(clear) {
		var r = this.rotation(), attach = this.attach, doside = function(name, px) {
			attach({
				name: name,
				geomult: 1,
				kind: "wall",
				matinstance: mat,
				coneGeometry: true,
				scale: [1, 70, 70],
				position: [px, py, 25],
				rotation: [rx, -r.y, -r.z]
			});
		}, rx = r.x, pd = rx % P4, backtilted = rx < P2, py = backtilted ? 25 : -25,
			mat = this.material, side = this.opts.side, both = side == "both", oldside;
		rx *= -1;
		if (Math.abs(pd - P4) < 0.1)
			pd -= P4;
		if (backtilted)
			rx += pd;
		else
			rx -= pd;
		if (clear && this.wall)
			for (oldside in this.wall)
				this[oldside].remove();
		if (both || side == "right")
			doside("right", 50);
		if (both || side == "left")
			doside("left", -50);
	},
	onbound: function() {
		this.setSides();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			side: "neither",
			repeat: [1, 1],
			rotation: [P4, 0, 0]
		}, this.opts);
	}
}, zero.core.Floor);