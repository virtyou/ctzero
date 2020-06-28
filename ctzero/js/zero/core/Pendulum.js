zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	_tick: function(dts, vel) {
		var pendz = this.pends, oz = this.opts,
			damp = oz.damp, vd = oz.veldamp,
			rot = this.rotation(null, true),
			dim, pend, other = { x: "z", z: "x" };
		for (dim of ["x", "z"]) {
			pend = pendz[dim];
			pend.boost = (pend.boost + (vel[other[dim]] + vel.y) / vd) * oz.drag;
			pend.acceleration = dts * Math.sin(rot[dim]) / damp;
			this.adjust("rotation", dim, pend.value);
		};
	},
	tick: function(dts) {
		var pos = this.position(null, true);
		this.pos && this._tick(dts, this.localize(zero.core.util.vector(this.pos, pos)));
		this.pos = pos;
	},
	setSprings: function() {
		var oz = this.opts, thaz = this,
			pz = this.pends = {}, f, k, s;
		["x", "z"].forEach(function(dim, i) {
			s = { hard: opts.hard };
			if (s.hard) {
				f = oz.flex;
				k = oz.curl[i] + oz.kink * Math.random() - oz.kink / 2;
				s.bounds = {
					min: k - f,
					max: k + f
				};
			}
			pz[dim] = zero.core.springController.add(s, dim, thaz);
		});
	},
	init: function(opts) {
		this.setSprings();
	}
}, zero.core.Thing);