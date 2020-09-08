zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var pos, v, h, oz = this.opts, bz = oz.bounder.bounds,
			vel = oz.velocity, i = oz.index, wobz = this.wobblers,
			t = zero.core.util.ticker, adjust = this.adjust;
		this._xyz.forEach(function(d, i) {
			v = vel[i] * dts;
			if (wobz[d])
				v += wobz[d][(t + i) % 60];
			v && adjust("position", d, v, true);
		});
		pos = this.position();
		this._xyz.forEach(function(d, i) {
			if (!vel[i]) return;
			h = (bz.max[d] - bz.min[d]) / 2;
			if (pos[d] < -h)
				pos[d] = h;
			else if (pos[d] > h)
				pos[d] = -h;
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			sphereGeometry: true
		}, this.opts);
		var vri, wobz = this.wobblers = {};
		this._xyz.forEach(function(d, i) {
			vri = opts.variance[i];
			if (vri)
				wobz[d] = zero.core.trig.segs(60, vri);
		});
	}
}, zero.core.Thing);