zero.core.Particles = CT.Class({
	CLASSNAME: "zero.core.Particles",
	removables: false,
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
		while (this._staleTip()) {
			retired = this.active.shift();
			retired.material.opacity = 0;
			retired.position([0, 0, 0]);
			this.pool.push(retired);
		}
	},
	_staleTip: function() {
		return this.active.length && this._stale(this.active[0]);
	},
	_stale: function(act) {
		return this._dissolved(act.material) || this._floored(act);
	},
	_dissolved: function(mat) {
		return this.opts.dissolve && (mat.opacity < 0);
	},
	_floored: function(thing) {
		return this.opts.floorbound && (thing.position().y < 0);
	},
	release: function(number, pos) {
		var activated, oz = this.opts, zcu = zero.core.util;
		if (!this.active) {
			this.active = [];
			this.pool = Object.values(this.particle);
		}
		while (number && this.pool.length) {
			activated = this.pool.shift();
			activated.setOpacity(0.9);
			if (oz.grow || oz.pulse) {
				activated._size = oz.size + oz.sizeVariance * Math.random();
				activated.scale(activated._size);
			}
			pos && activated.position(pos);
			oz.acceleration && activated.setVelocity();
			this.active.push(activated);
			number -= 1;
		}
		//number && this.log("unable to release", number, "particles");
	},
	rebound: function() {
		var p, oz = this.opts, bz = oz.bounder.bounds,
			lens = this._xyz.map((d, i) => (bz.max[d] - bz.min[d]) / oz.scale[i]),
			halves = lens.map(v => v / 2);
		for (p in this.particle)
			this.particle[p].setLimits(lens, halves, oz.scale);
	},
	preassemble: function() {
		var i, size, oz = this.opts, pz = oz.parts,
			matinst = this.material = oz.sharemat && new THREE["Mesh" + oz.matcat + "Material"](oz.pmat);
		for (i = 0; i < oz.count; i++) {
			size = oz.size + oz.sizeVariance * Math.random();
			pz.push({
				index: i,
				thing: "Bit",
				name: "p" + i,
				kind: "particle",
				grow: oz.grow,
				pulse: oz.pulse,
				material: oz.pmat,
				matinstance: matinst,
				bounder: oz.bounder,
				stripset: oz.pstrip,
				variance: oz.variance,
				velocity: oz.velocity,
				velVariance: oz.velVariance,
				acceleration: oz.acceleration,
				scale: [size, size, size],
				size: size,
				topobound: oz.topobound,
				manager: oz.name
			});
		}
	},
	undrip: function() {
		clearInterval(this.dripper);
		delete this.dripper;
	},
	onremove: function() {
		this._audio && this._audio.pause();
		delete this._audio;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[opts.name], zero.base.particles[opts.name], {
			count: 50,
			size: 5,
			sizeVariance: 5,
			velocity: [0, 0, 0],
			variance: [0, 0, 0]
		}, this.opts);
		if (opts.pcolor) {
			if (!opts.pmat)
				opts.pmat = {};
			opts.pmat.color = opts.pcolor;
		}
		if (opts.drip) // TODO: cancel interval at some point?
			this.dripper = setInterval(this.release, 1000 / (opts.count * opts.dissolve || 1), 1);
		var PA = zero.core.Particles.audio;
		if (PA && PA[opts.name])
			this._audio = zero.core.audio.ambience(PA[opts.name], 0.1, true);
	}
}, zero.core.Thing);