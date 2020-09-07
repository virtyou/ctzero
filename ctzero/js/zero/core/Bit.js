zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var oz = this.opts, bz = oz.bounder.bounds,
			vel = oz.velocity, i = oz.index, wobz = this.wobblers,
			v, t = zero.core.util.ticker, adjust = this.adjust;
		["x", "y", "z"].forEach(function(d, i) {
			v = vel[i];
			if (wobz[d])
				v += wobz[d][(t + i) % 60];
			v && adjust("position", d, v, true);
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			matcat: "Basic",
			sphereGeometry: true
		}, this.opts);
		var vri, wobz = this.wobblers = {};
		["x", "y", "z"].forEach(function(d, i) {
			vri = opts.variance[i];
			if (vri)
				wobz[d] = zero.core.trig.segs(60, vri);
		});
	}
}, zero.core.Thing);