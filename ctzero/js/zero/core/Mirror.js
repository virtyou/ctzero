// wall-affixed mirror: a Reflector pane sized for close-up viewing, with an
// optional decorative frame part (geometry/texture configurable via opts.frame).
// kind: "poster" reuses Thing's existing wall-placement support (autoRot()/
// wallStick() in Thing.js, plus arrow-key repositioning in Controls.js) - just
// pass a "wall" (0-3) and "bone"/"anchor" like any other wall-mounted thing.
zero.core.Mirror = CT.Class({
	CLASSNAME: "zero.core.Mirror",
	preassemble: function() {
		var oz = this.opts, f = oz.frame;
		if (!f) return;
		oz.parts.push(CT.merge(f.part, {
			name: "frame",
			boxGeometry: true,
			scale: [oz.width + f.border * 2, oz.height + f.border * 2, f.depth],
			position: [0, 0, -(f.depth / 2 + 0.5)], // sits just behind the reflective pane
			material: f.material,
			texture: f.texture
		}));
	},
	init: function(opts) {
		var frameDefaults = {
			border: 4,
			depth: 3,
			material: { color: 0x2b1d0e }, // placeholder - override via opts.frame.material
			texture: null,
			part: {}
		};
		this.opts = opts = CT.merge(opts, {
			kind: "poster",
			width: 40,
			height: 60,
			textureWidth: 1024,
			textureHeight: 1024,
			frame: frameDefaults
		}, this.opts);
		if (opts.frame) // merge caller's partial frame opts over the defaults, not replace them
			opts.frame = CT.merge(opts.frame, frameDefaults);
		// Reflector.init() already ran (and derived planeGeometry from ITS width/height
		// defaults) before this - redo it now that width/height reflect Mirror's own defaults
		if (!this.min_opts.planeGeometry && !this.min_opts.geometry)
			opts.planeGeometry = [opts.width, opts.height];
	}
}, zero.core.Reflector);
