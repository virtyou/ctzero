zero.core.Particles = CT.Class({
	CLASSNAME: "zero.core.Particles",
	tick: function(dts) {
		var p, oz = this.opts;
		for (p in this.particle)
			this.particle[p].tick(dts);
	},
	rebound: function() {
		var p, part, oz = this.opts,
			bz = oz.bounder.bounds, r = Math.random,
			xl = bz.max.x - bz.min.y, xd = xl * 2,
			yl = bz.max.y - bz.min.y, yd = yl * 2
			zl = bz.max.z - bz.min.z, zd = zl * 2;
		for (p in this.particle) {
			part = this.particle[p];
			part.position([r() * xd - xl, r() * yd - yl, r() * zd - zl]);
		}
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		for (i = 0; i < oz.count; i++) {
			pz.push({
				index: i,
				thing: "Bit",
				name: "p" + i,
				kind: "particle",
				material: oz.pmat,
				bounder: oz.bounder,
				velocity: oz.velocity,
				variance: oz.variance,
				geometry: new THREE.SphereGeometry(oz.size + oz.sizeVarience * Math.random())
			});
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.core.Particles.kinds[opts.kind], {
			count: 20,
			size: 0.05,
			sizeVariance: 0.2,
			velocity: [0, 0, 0],
			variance: [5, 5, 5]
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Particles.kinds = {
	bubbles: {
		velocity: [0, 5, 0],
		pmat: {
			opacity: 0.25,
			color: 0x22ccff,
			reflectivity: 0.9,
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