zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	ticks: {
		hard: function(dts, pos) {
			var pendz = this.pends, oz = this.opts,
				vel = this.localize(zero.core.util.vector(this.pos, pos)),
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
		_soft: function(dts, vel, acc) {
			var pendz = this.pends, oz = this.opts,
				damp = oz.damp, vd = oz.veldamp,
				rot = this.rotation(null, true), rd, ao, sa,
				dim, pend, other = { x: "z", z: "x" };
	//		for (dim of ["x", "z"]) {
			for (dim of ["z"]) {
				pend = pendz[dim];
				sa = rd = rot[dim];// - oz.srot[dim];

	//			if (dim == "x")
	//				sa = Math.PI - rd;
	//			vo = vel[other[dim]];
	//			ao = acc[other[dim]];
//				pend.acceleration = -oz.mass * Math.sin(rd);
//				pend.acceleration = -oz.mass * Math.sin(sa)
//					- 0.02 * ao * Math.cos(rd) - damp * pend.velocity;

				pend.acceleration = -oz.mass * Math.sin(sa) - damp * pend.velocity;

				this.adjust("rotation", dim, pend.value);
			};
		},
		soft: function(dts, pos) {
			var loc = this.localize, velo = zero.core.util.velocity,
				vel = velo(loc(this.pos), loc(pos), dts);
			this.vel && this.ticks._soft(dts, vel, velo(this.vel, vel, dts));
			this.vel = vel;
		}
	},
	tick: function(dts) {
		var pos = this.position(null, true);
		this.pos && this._tick(dts, pos);
		this.pos = pos;
	},
	setSprings: function() {
		var oz = this.opts, thaz = this,
			pz = this.pends = {}, f, k, s;
		["x", "z"].forEach(function(dim, i) {
			s = { hard: oz.hard };
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
		this._tick = this.ticks[this.opts.hard ? "hard" : "soft"];
		this.setSprings();
	}
}, zero.core.Thing);