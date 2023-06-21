zero.core.Bit = CT.Class({
	CLASSNAME: "zero.core.Bit",
	tick: function(dts) {
		var oz = this.opts, dz = this._xyz, wobz = this.wobblers,
			vel = this.velocity, acc = oz.acceleration, pos, i, d,
			v, t = zero.core.util.ticker % 60, adjust = this.adjust,
			lmi, lma, dmi, dma, df, lf, lz = this.limits;
		if (oz.grow || oz.pulse) {
			if (oz.grow)
				this._size += oz.grow * dts;
			if (oz.pulse)
				this._size += this.pulser[t];
			this.scale(this._size);
		}
		if (this.spin)
			for (d in this.spin)
				adjust("rotation", d, this.spin[d], true);
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
		if (!lz) return;
		pos = this.position();
		lf = lz.full;
		lmi = lz.min;
		lma = lz.max;
		for (i = 0; i < 3; i++) {
			if (!vel[i]) continue;
			d = dz[i];
			df = lf[i];
			dmi = lmi[i];
			dma = lma[i];
			if (pos[d] < dmi)
				pos[d] += df;
			else if (pos[d] > dma)
				pos[d] -= df;
		}
	},
	setVelocity: function() {
		this.velocity = this.opts.velocity.map(v => v);
	},
	setLimits: function(lens, halves, scale) {
		this.limits = {
			full: lens,
			max: halves.slice(),
			min: halves.map(v => -v)
		};
		this.position(lens.map((v, i) => Math.random() * v - halves[i]));
		if (this.opts.topobound) {
			var peak = zero.core.current.room.getPeak(this.safePos(), this.radii),
				diff = peak / scale[1] - this.limits.min[1];
			this.limits.min[1] += diff;
			this.limits.max[1] += diff;
		}
	},
	resetPosition: function(base, skipUpdate) {
		var pv = this.opts.posVariance;
		base = base || [0, 0, 0];
		if (pv) {
			base = base.map(function(p, i) {
				return p + Math.random() * 2 * pv[i] - pv[i];
			});
		}
		skipUpdate || this.position(base);
		return base;
	},
	init: function(opts) {
		var ename = opts.manager ? (opts.manager + "_bit") : opts.name;
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[ename], opts.shape || {
			sphereGeometry: true
		}, this.opts);
		if (opts.ranges) {
			for (var r in opts.ranges) {
				var ro = opts.ranges[r];
				opts[r] = (ro.base || 0) + CT.data.random(ro.variance, ro.isFloat);
			}
		}
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
		if (pv)
			opts.position = this.resetPosition(opts.position, true);
		if (opts.spin) {
			this.spin = {
				x: CT.data.random(0.25) - 0.125,
				y: CT.data.random(0.25) - 0.125,
				z: CT.data.random(0.25) - 0.125
			};
		}
		this._size = opts.size || 1;
		if (opts.pulse)
			this.pulser = zero.core.trig.segs(60, opts.pulse);
		opts.velocity && this.setVelocity();
	}
}, zero.core.Thing);