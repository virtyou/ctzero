zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	tick: function(dts, vel) {
		var pendz = this.pends, oz = this.opts,
			damp = oz.damp, vd = oz.veldamp,
			rot = this.rotation(null, true),
			dim, pend;
		for (dim of ["x", "z"]) {
			pend = pendz[dim];
			pend.boost = (pend.boost + (vel[dim] + vel.y) / vd) * oz.drag;
			pend.acceleration = dts * Math.sin(rot[dim]) / damp;
			this.adjust("rotation", dim, pend.value);
		};
	},
	setSprings: function() {
		var oz = this.opts, thaz = this,
			pz = this.pends = {}, f, k, s;
		["x", "z"].forEach(function(dim, i) {
			s = { hard: true };
			if (!oz.unbounded) {
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