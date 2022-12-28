zero.core.Light = CT.Class({
	CLASSNAME: "zero.core.Light",
	setIntensity: function(intensity) {
		this.opts.intensity = intensity;
		if (this.isReady())
			this.thring.intensity = intensity;
	},
	setColor: function(color) {
		var c = this.thring.color;
		this.opts.color = color; // revise...
		if (Array.isArray(color))
			c.setRGB.apply(c, color);
		else
			c.setRGB(color.r, color.g, color.b);
	},
	build: function() {
		var oz = this.opts, v = oz.variety, cfg = core.config.ctzero,
			constructor = v.charAt(0).toUpperCase() + v.slice(1) + "Light";
		this.thring = this.placer = new THREE[constructor](oz.color, oz.intensity);
		if (oz.variety != "ambient") {
			this.thring.castShadow = cfg.shadows;
			this.thring.position.set.apply(this.thring.position, oz.position);
		}
		(oz.scene || oz.anchor).add(this.thring);
		this._.built();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			intensity: 1,
			color: 0xaaaaaa,
			variety: "directional" // or "ambient" or "point"
		});
	}
}, zero.core.Thing);