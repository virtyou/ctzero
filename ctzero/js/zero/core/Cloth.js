zero.core.Cloth = CT.Class({
	CLASSNAME: "zero.core.Cloth",
	onremove: function() {
		delete this.opts.garment; // otherwise circular
		zero.core.ammo.unSoft(this.thring);
		zero.core.ammo.unKinematic(this.opts.frame);
	},
	modsoft: function(tweaks) {
		const sbcfg = this.softBody.get_m_cfg();
		for (let pname in tweaks)
			sbcfg["set_" + pname](tweaks[pname]);
	},
	postassemble: function() {
		const oz = this.opts;
		this.softBody = zero.core.ammo.softBody(this, oz.frame, oz.anchorPoints);
		oz.tweaks && this.modsoft(oz.tweaks);
		oz.postTweaks && setTImeout(() => this.modsoft(oz.postTweaks), 5000);
	},
	init: function(opts) { // should translate geometry?
		opts.segLen = opts.segLen || 1;
		opts.width = opts.width || 4;
		opts.height = opts.height || 3;
		opts.numSegsZ = opts.width / opts.segLen;
		opts.numSegsY = opts.height / opts.segLen;
		if (opts.repeatSegs)
			opts.repeat = [opts.numSegsZ, opts.numSegsY];
		if (!opts.displacement)
			opts.displacement = { x: 0, y: -opts.height, z: 0 };
		if (!opts.frame)
			opts.frame = opts.scene;
		opts.scene = zero.core.camera.scene;
		this.opts = opts = CT.merge(opts, {
			flatDim: "z",
			matcat: "Lambert",
			anchorPoints: "ends",
			bufferGeometry: true,
			planeGeometry: [opts.width, opts.height, opts.numSegsZ, opts.numSegsY],
			material: {
				side: THREE.DoubleSide
			}
		}, this.opts);
	}
}, zero.core.Thing);