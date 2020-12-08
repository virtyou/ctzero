zero.core.Ramp = CT.Class({
	CLASSNAME: "zero.core.Ramp",
	getTop: function(pos) {
		var bz = this.bounds,
			zmin = bz.min.z,
			zmax = bz.max.z,
			ymin = bz.min.y,
			ymax = bz.max.y,
			zdif = zmax - zmin,
			ydif = ymax - ymin,
			zpos = pos.z - zmin,
			zper = zpos / zdif;
		return ymin + zper * ydif;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			repeat: [1, 1],
			rotation: [3.14/4, 0, 0]
		}, this.opts);
	}
}, zero.core.Floor);