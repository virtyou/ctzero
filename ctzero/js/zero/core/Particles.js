zero.core.Particles = CT.Class({
	CLASSNAME: "zero.core.Particles",
	removables: false,
	_floor: 0,
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
			retired.resetPosition();
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
		return this.opts.floorbound && (thing.position().y < this._floor);
	},
	release: function(number, pos) {
		var activated, oz = this.opts;
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
			pos && activated.position(pos)
			oz.acceleration && activated.setVelocity();
			this.active.push(activated);
			number -= 1;
		}
		if (pos && oz.floorbound && oz.refloor)
			this._floor = pos.y;
		//number && this.log("unable to release", number, "particles");
	},
	rebound: function() {
		var p, oz = this.opts, bz = oz.bounder.bounds,
			lens = this._xyz.map((d, i) => (bz.max[d] - bz.min[d]) / oz.scale[i]),
			halves = lens.map(v => v / 2);
		for (p in this.particle)
			this.particle[p].setLimits(lens, halves, oz.scale);
	},
	getMat: function(index) {
		var oz = this.opts;
		if (this.material)
			return this.material;
		if (oz.sharemats) {
			if (!this.materials)
				this.materials = oz.sharemats.map(c => zero.core.util.randMat(c, oz.pmat));
			return this.materials[index % this.materials.length];
		}
	},
	preassemble: function() {
		var i, size, oz = this.opts, pz = oz.parts, matinst;
		if (oz.pmatColor) {
			if (!oz.pmat)
				oz.pmat = {};
			oz.pmat.color = oz.pmatColor;
		}
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
				matinstance: this.getMat(i),
				bounder: oz.bounder,
				stripset: oz.pstrip,
				variance: oz.variance,
				velocity: oz.velocity,
				velVariance: oz.velVariance,
				posVariance: oz.posVariance,
				acceleration: oz.acceleration,
				scale: [size, size, size],
				size: size,
				topobound: oz.topobound,
				manager: oz.name,
				shape: oz.bitshape
			});
		}
	},
	undrip: function() {
		clearInterval(this.dripper);
		delete this.dripper;
	},
	onremove: function() {
		this._audio && this._audio.pause();
		this.dripper && this.undrip();
		delete this._audio;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[opts.name], zero.base.particles[opts.name], {
			count: 50,
			size: 5,
			sizeVariance: 5,
			velocity: [0, 0, 0],
			variance: [0, 0, 0],
			ambients: [opts.name]
		}, this.opts);
		if (opts.pcolor) {
			if (!opts.pmat)
				opts.pmat = {};
			opts.pmat.color = opts.pcolor;
		}
		if (opts.drip)
			this.dripper = setInterval(this.release, 1000 / (opts.count * opts.dissolve || 1), 1);
	}
}, zero.core.Thing);