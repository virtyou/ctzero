zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var oz = this.opts, dz = this._xyz, wobz = this.wobblers,
			vel = this.velocity, acc = oz.acceleration, pos, i, d,
			v, t = zero.core.util.ticker % 60, adjust = this.adjust,
			lmi, lma, dmi, dma;
		if (oz.grow || oz.pulse) {
			if (oz.grow)
				this._size += oz.grow * dts;
			if (oz.pulse)
				this._size += this.pulser[t];
			this.scale(this._size);
		}
		if (!vel) return;
		for (i = 0; i < 3; i++) {
			d = dz[i];
			v = vel[i] * dts;
			if (acc)
				vel[i] += acc[i] * dts;
			if (wobz[d])
				v += wobz[d][t];
			v && adjust("position", d, v, true);
		}
		if (!this.limits) return;
		pos = this.position();
		lmi = this.limits.min;
		lma = this.limits.max;
		for (i = 0; i < 3; i++) {
			if (!vel[i]) continue;
			d = dz[i];
			dmi = lmi[i];
			dma = lma[i];
			if (pos[d] < dmi)
				pos[d] = dma;
			else if (pos[d] > dma)
				pos[d] = dmi;
		}
	},
	setVelocity: function() {
		this.velocity = this.opts.velocity.map(v => v);
	},
	setLimits: function(lens, halves, scale) {
		this.limits = {
			max: halves,
			min: halves.map(v => -v)
		};
		this.position(lens.map((v, i) => Math.random() * v - halves[i]));
		if (this.opts.topobound) {
			var peak = zero.core.current.room.getPeak(this.safePos(), this.radii),
				diff = peak / scale[1] - this.limits.min[1];
			this.limits.min[1] += diff;
//			this.limits.max[1] += diff;
		}
	},
	init: function(opts) {
		var ename = opts.manager ? (opts.manager + "_bit") : opts.name;
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[ename], {
			sphereGeometry: true
		}, this.opts);
		var vel = opts.velocity, wobz = this.wobblers = {},
			vri, vv = opts.velVariance, pv = opts.posVariance;
		opts.variance && this._xyz.forEach(function(d, i) {
			vri = opts.variance[i];
			if (vri)
				wobz[d] = zero.core.trig.segs(60, vri);
		});
		if (vv) {
			opts.velocity = vel.map(function(v, i) {
				return v + Math.random() * 2 * vv[i] - vv[i];
			});
		} else if (vel && !opts.acceleration && !Object.keys(wobz).length)
			if (!vel[0] && !vel[1] && !vel[2])
				opts.velocity = null;
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