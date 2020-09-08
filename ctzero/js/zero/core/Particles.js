zero.core.Particles = CT.Class({
	CLASSNAME: "zero.core.Particles",
	tick: function(dts) {
		var p, oz = this.opts;
		if (!this.isReady() || !oz.bounder.bounds) return;
		for (p in this.particle)
			this.particle[p].tick(dts);
	},
	rebound: function() {
		var p, part, oz = this.opts,
			bz = oz.bounder.bounds, r = Math.random,
			xl = bz.max.x - bz.min.y, xh = xl / 2,
			yl = bz.max.y - bz.min.y, yh = yl / 2
			zl = bz.max.z - bz.min.z, zh = zl / 2;
		for (p in this.particle) {
			part = this.particle[p];
			part.position([r() * xl - xh, r() * yl - yh, r() * zl - zh]);

		}
	},
	preassemble: function() {
		var i, size, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.count; i++) {
			size = oz.size + oz.sizeVariance * Math.random();
			pz.push({
				index: i,
				thing: "Bit",
				name: "p" + i,
				kind: "particle",
				material: oz.pmat,
				bounder: oz.bounder,
				velocity: oz.velocity,
				variance: oz.variance,
				scale: [size, size, size]
			});
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.core.Particles.kinds[opts.name], {
			count: 20,
			size: 0.05,
			sizeVariance: 0.1,
			velocity: [0, 0, 0],
			variance: [1, 1, 1]
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Particles.kinds = {
	bubbles: {
		velocity: [0, 25, 0],
		variance: [1, 0, 1],
		pmat: {
			opacity: 0.6,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	flames: {

	},
	smoke: {

	},
	fog: {

	},
	aura: {

	}
};