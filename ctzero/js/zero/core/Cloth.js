zero.core.Cloth = CT.Class({
	CLASSNAME: "zero.core.Cloth",
	onremove: function() {
		zero.core.ammo.unSoft(this.thring);
		zero.core.ammo.unKinematic(this.opts.frame);
	},
	postassemble: function() {
		var oz = this.opts;
		this.softBody = zero.core.ammo.softBody(this, oz.frame, oz.anchorPoints);
	},
	init: function(opts) { // should translate geometry?
		opts.dmult = opts.dmult || 1; // example has 5
		opts.width = opts.width || 4;
		opts.height = opts.height || 3;
		opts.numSegsZ = opts.width * opts.dmult;
		opts.numSegsY = opts.height * opts.dmult;
		if (opts.repeatSegs)
			opts.repeat = [opts.numSegsZ, opts.numSegsY];
		// meh? (frame/scene below)
		opts.frame = opts.scene;
		opts.scene = zero.core.camera.scene;
		this.opts = opts = CT.merge(opts, {
			anchorPoints: "ends",
			bufferGeometry: true,
			planeGeometry: [opts.width, opts.height, opts.numSegsZ, opts.numSegsY],
			material: {
				side: THREE.DoubleSide
			}
		}, this.opts);
	}
}, zero.core.Thing);