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
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			repeat: [1, 1],
			rotation: [3.14/4, 0, 0]
		}, this.opts);
	}
}, zero.core.Floor);