zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var pos, v, h, oz = this.opts, bz = oz.bounder && oz.bounder.bounds,
			wobz = this.wobblers, vel = this.velocity, acc = oz.acceleration,
			i = oz.index, t = zero.core.util.ticker, adjust = this.adjust;
		this._xyz.forEach(function(d, i) {
			v = vel[i] * dts;
			if (acc)
				vel[i] += acc[i] * dts;
			if (wobz[d])
				v += wobz[d][(t + i) % 60];
			v && adjust("position", d, v, true);
		});
		if (!bz) return;
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
	setVelocity: function() {
		this.velocity = this.opts.velocity.map(v => v);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			sphereGeometry: true
		}, this.opts);
		var vri, wobz = this.wobblers = {}, vv = opts.velVariance;
		this._xyz.forEach(function(d, i) {
			vri = opts.variance[i];
			if (vri)
				wobz[d] = zero.core.trig.segs(60, vri);
		});
		if (vv) {
			opts.velocity = opts.velocity.map(function(v, i) {
				return v + Math.random() * 2 * vv[i] - vv[i];
			});
		}
		this.setVelocity();
	}
}, zero.core.Thing);