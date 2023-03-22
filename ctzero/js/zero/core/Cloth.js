zero.core.Cloth = CT.Class({
	CLASSNAME: "zero.core.Cloth",
	onremove: function() {
		delete this.opts.garment; // otherwise circular
		zero.core.ammo.unSoft(this.thring);
		zero.core.ammo.unKinematic(this.frame);
	},
	modsoft: function(tweaks) {
		const sbcfg = this.softBody.get_m_cfg();
		for (let pname in tweaks)
			sbcfg["set_" + pname](tweaks[pname]);
	},
	setsoft: function() {
		const oz = this.opts;
		this.frame = oz.frame;
		if (typeof this.frame == "string")
			this.frame = oz.garment[this.frame].thring;
		this.softBody = zero.core.ammo.softBody(this, this.frame, oz.anchorPoints, oz.anchorFriction);
		oz.tweaks && this.modsoft(oz.tweaks);
		oz.postTweaks && setTimeout(() => this.modsoft(oz.postTweaks), 5000);
		this.thring.material.transparent = oz.reallyTrans || false;
	},
	postassemble: function() {
		core.config.ctzero.gravity ? setTimeout(this.setsoft, 1000) : this.setsoft();
	},
	init: function(opts) { // should translate geometry?
		opts.segLen = opts.segLen || 4;
		opts.width = opts.width || 8;
		opts.height = opts.height || 8;
		opts.numSegsZ = opts.width / opts.segLen;
		opts.numSegsY = opts.height / opts.segLen;
		if (opts.repeatSegs)
			opts.repeat = [opts.numSegsZ, opts.numSegsY];
		if (!opts.displacement)
			opts.displacement = { x: 0, y: -opts.height, z: 0 };
		if (!opts.frame)
			opts.frame = opts.scene;
		opts.scene = zero.core.camera.scene;
		opts.reallyTrans = opts.material && opts.material.transparent;
		this.opts = opts = CT.merge(opts, {
			flatDim: "z",
			matcat: "Lambert",
			anchorPoints: "ends",
			bufferGeometry: true,
			noAlphaTest: true,
			planeGeometry: [opts.width, opts.height, opts.numSegsZ, opts.numSegsY],
			material: {
				transparent: true,
				opacity: 0,
				side: THREE.DoubleSide
			}
		}, this.opts);
	}
}, zero.core.Thing);