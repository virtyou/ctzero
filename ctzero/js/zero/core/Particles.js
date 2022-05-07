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
			activated.setOpacity(0.9);
			if (oz.grow || oz.pulse) {
				activated._size = oz.size + oz.sizeVariance * Math.random();
				activated.scale(activated._size);
			}
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
			this.particle[p].setLimits(lens, halves);
	},
	preassemble: function() {
		var i, size, oz = this.opts, pz = oz.parts,
			matinst = oz.sharemat && new THREE["Mesh" + oz.matcat + "Material"](oz.pmat);
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
				manager: oz.name
			});
		}
	},
	undrip: function() {
		clearInterval(this.dripper);
		delete this.dripper;
	},
	onremove: function() {
		this._audio && this._audio.remove();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, core.config.ctzero.env[opts.name], zero.base.particles[opts.name], {
			count: 50,
			size: 5,
			sizeVariance: 5,
			velocity: [0, 0, 0],
			variance: [0, 0, 0]
		}, this.opts);
		if (opts.drip) // TODO: cancel interval at some point?
			this.dripper = setInterval(this.release, 1000 / (opts.count * opts.dissolve || 1), 1);
		var PA = zero.core.Particles.audio;
		if (PA && PA[opts.name]) {
			this._audio = CT.dom.audio();
			this._audio.loop = true;
			this._audio.volume = 0.1;
			this._audio.src = PA[opts.name];
			document.body.appendChild(this._audio);
			zero.core.util.playMedia(this._audio);
		}
	}
}, zero.core.Thing);