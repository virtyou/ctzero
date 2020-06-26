zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	tick: function(dts, vel) {
		var pendz = this.pends, oz = this.opts,
			damp = oz.damp, vd = oz.veldamp,
			rot = this.rotation(null, true),
			thaz = this, pend;
		["x", "z"].forEach(function(dim) {
			pend = pendz[dim];
			pend.boost = (pend.boost + (vel[dim] + vel.y) / vd) * oz.drag;
			pend.acceleration = dts * Math.sin(rot[dim]) / damp;
			thaz.adjust("rotation", dim, pend.value);
		});
	},
	setSprings: function() {
		var oz = this.opts, thaz = this,
			pz = this.pends = {}, f, k;
		["x", "z"].forEach(function(dim) {
			f = oz.flex;
			k = oz.kink * Math.random() - oz.kink / 2;
			pz[dim] = zero.core.springController.add({
				hard: true,
				bounds: {
					min: k - f,
					max: k + f
				}
			}, dim, thaz);
		});
	},
	init: function(opts) {
		this.setSprings();
	}
}, zero.core.Thing);