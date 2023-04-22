zero.core.Pendulum = CT.Class({
	CLASSNAME: "zero.core.Pendulum",
	dims: ["x", "z"],
	other: { x: "z", z: "x" },
	ticks: {
		hard: function(dts) {
			var pendz = this.pends, dim, pend,
				w = this.wiggler, gravvy = this.gravvy, accy = this.accy,
				rot = gravvy && this.rotation(null, true), zsin = zero.core.trig.sin,
				b = w ? w[(zero.core.util.ticker + this.wigdex) % this.opts.wiggle] : 0;
			for (dim of this.dims) {
				pend = pendz[dim];
				if (accy) {
					pend.acceleration = b;
					if (gravvy)
						pend.acceleration += zsin(rot[dim]);
				}
				this.adjust("rotation", dim, pend.value);
			};
		},
		_soft: function(dts, vel) {
			var pendz = this.pends, oz = this.opts,
				damp = oz.damp, vd = oz.veldamp,
				rot = this.rotation(null, true), sa,
				zsin = zero.core.trig.sin, dim, pend;
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
		soft: function(dts) {
			var pos = this.position(null, true);
			if (this.pos) {
				var loc = this.localize, velo = zero.core.util.velocity;
				this.ticks._soft(dts, velo(loc(this.pos), loc(pos), dts, this.vel));
			}
			this.pos = pos;
		}
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
		this.tick = this.ticks[this.opts.hard ? "hard" : "soft"];
		this.setSprings();
		if (this.opts.wiggle) {
			this.wigdex = this.opts.index;//CT.data.random(this.opts.wiggle);
			this.wiggler = zero.core.trig.segs(this.opts.wiggle);
		}
		this.gravvy = !this.opts.nograv;
		this.accy = this.gravvy || !!this.wiggler;
		this.vel = new THREE.Vector3();
	}
}, zero.core.Thing);