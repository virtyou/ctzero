zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var pos, v, h, oz = this.opts, bz = oz.bounder && oz.bounder.bounds,
			wobz = this.wobblers, vel = this.velocity, acc = oz.acceleration,
			i = oz.index, t = zero.core.util.ticker % 60, adjust = this.adjust;
		if (oz.grow || oz.pulse) {
			if (oz.grow)
				this._size += oz.grow * dts;
			if (oz.pulse)
				this._size += this.pulser[t];
			this.scale(this._size);
		}
		vel && this._xyz.forEach(function(d, i) {
			v = vel[i] * dts;
			if (acc)
				vel[i] += acc[i] * dts;
			if (wobz[d])
				v += wobz[d][t];
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
		var ename = opts.manager ? (opts.manager + "_bit") : opts.name;
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[ename], {
			sphereGeometry: true
		}, this.opts);
		var vri, wobz = this.wobblers = {},
			vv = opts.velVariance, pv = opts.posVariance;
		opts.variance && this._xyz.forEach(function(d, i) {
			vri = opts.variance[i];
			if (vri)
				wobz[d] = zero.core.trig.segs(60, vri);
		});
		if (vv) {
			opts.velocity = opts.velocity.map(function(v, i) {
				return v + Math.random() * 2 * vv[i] - vv[i];
			});
		}
		if (pv) {
			opts.position = opts.position.map(function(p, i) {
				return p + Math.random() * 2 * pv[i] - pv[i];
			});
		}
		this._size = opts.size || 1;
		if (opts.pulse)
			this.pulser = zero.core.trig.segs(60, opts.pulse);
		opts.velocity && this.setVelocity();
	}
}, zero.core.Thing);