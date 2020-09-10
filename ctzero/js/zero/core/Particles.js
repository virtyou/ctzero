zero.core.Particles = CT.Class({
	CLASSNAME: "zero.core.Particles",
	tick: function(dts) {
		var p, oz = this.opts;
		if (!this.isReady()) return;
		if (this.active && this.active.length)
			this.tickActive(dts);
		else if (oz.bounder && oz.bounder.bounds)
			for (p in this.particle)
				this.particle[p].tick(dts);
	},
	tickActive: function(dts) {
		var p, retired, dissolve = this.opts.dissolve;
		for (p of this.active)
			if (!dissolve || p.setOpacity(-dts * dissolve, true) > 0)
				p.tick(dts);
		while (dissolve && this.active.length && this.active[0].material.opacity < 0) {
			retired = this.active.shift();
			retired.position([0, 0, 0]);
			this.pool.push(retired);
		}
	},
	release: function(number) {
		var activated, oz = this.opts;
		if (!this.active) {
			this.active = [];
			this.pool = Object.values(this.particle);
		}
		while (number && this.pool.length) {
			activated = this.pool.shift();
			activated.setOpacity(1);
			oz.acceleration && activated.setVelocity();
			this.active.push(activated);
			number -= 1;
		}
		number && this.log("unable to release", number, "particles");
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
				variance: oz.variance,
				velocity: oz.velocity,
				velVariance: oz.velVariance,
				acceleration: oz.acceleration,
				scale: [size, size, size]
			});
		}
	},
	undrip: function() {
		clearInterval(this.dripper);
		delete this.dripper;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, zero.core.Particles.kinds[opts.name], {
			count: 50,
			size: 0.05,
			sizeVariance: 0.1,
			velocity: [0, 0, 0],
			variance: [0, 0, 0]
		}, this.opts);
		if (opts.drip) // TODO: cancel interval at some point?
			this.dripper = setInterval(this.release, 1000 / (opts.count * opts.dissolve || 1), 1);
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
	bubbletrail: {
		count: 30,
		velocity: [0, -400, 0],
		velVariance: [25, 25, 25],
		variance: [1, 1, 1],
		dissolve: 0.25,
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0x22ccff,
			transparent: true
		}
	},
	sparks: {
		count: 20,
		size: 0.01,
		sizeVariance: 0.04,
		velocity: [0, 24, 0],
		acceleration: [0, -24, 0],
		velVariance: [40, 0, 40],
		dissolve: 0.25,
		drip: true,
		pmat: {
			opacity: 0,
			shininess: 150,
			color: 0xff2222,
			transparent: true
		}
	},
	smoke: {
		count: 8,
		sizeVariance: 0.4,
		velocity: [0, 8, 0],
		velVariance: [4, 0, 4],
		dissolve: 0.1,
		drip: true,
		pmat: {
			opacity: 0,
			color: 0x888888,
			transparent: true
		}
	},
	glow: {

	},
	fog: {

	},
	aura: {

	}
};