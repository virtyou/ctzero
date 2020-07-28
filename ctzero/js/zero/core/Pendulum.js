zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	dims: ["x", "z"],
	other: { x: "z", z: "x" },
	ticks: {
		hard: function(dts, pos) {
			var pendz = this.pends, dim, pend,
				rot = this.rotation(null, true),
				zsin = zero.core.trig.sin;
			for (dim of this.dims) {
				pend = pendz[dim];
				pend.acceleration = zsin(rot[dim]);
				this.adjust("rotation", dim, pend.value);
			};
		},
		_soft: function(dts, vel, acc) {
			var pendz = this.pends, oz = this.opts,
				damp = oz.damp, vd = oz.veldamp,
				rot = this.rotation(null, true), sa,
				zsin = zero.core.trig.sin,
				dim, pend;
			for (dim of this.dims) {
				pend = pendz[dim];
				sa = rot[dim];
				if (dim == "x")
					sa -= Math.PI;
				// TODO: fix -- not quite right yet!!
				pend.acceleration = -oz.mass * zsin(sa) - damp * pend.velocity;
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
		this.dims.forEach(function(dim, i) {
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