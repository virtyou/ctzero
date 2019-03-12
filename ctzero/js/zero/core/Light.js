zero.core.Light = CT.Class({
	CLASSNAME: "zero.core.Light",
	setIntensity: function(intensity) {
		this.log("setting intensity to", intensity);
		this.opts.intensity = this.thring.intensity = intensity;
	},
	setColor: function(color) {
		var c = this.thring.color;
		this.opts.color = color;
		c.setRGB.apply(c, color);
	},
	build: function() {
		var oz = this.opts, v = oz.variety,
			constructor = v.charAt(0).toUpperCase() + v.slice(1) + "Light";
		this.thring = new THREE[constructor](oz.color, oz.intensity);
		if (oz.variety != "ambient")
			this.thring.position.set.apply(this.thring.position, oz.position);
		oz.scene.add(this.thring);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			intensity: 1,
			color: 0xaaaaaa,
			variety: "directional" // or "ambient" or "point"
		});
	}
}, zero.core.Thing);