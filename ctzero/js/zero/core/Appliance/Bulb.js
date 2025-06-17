zero.core.Appliance.Bulb = CT.Class({
	CLASSNAME: "zero.core.Appliance.Bulb",
	vmult: 0.02,
	_setPower: function(p) {
		const t = this.opts.timeout;
		this.power = p;
		this.sound("click");
		this.setIntensity();
		p && t && setTimeout(() => this.setPower(0), t * 1000);
	},
	setPower: function(p) {
		const d = this.opts.delay;
		if (p && d)
			return setTimeout(() => this._setPower(p), d);
		this._setPower(p);
	},
	setIntensity: function() {
		this.heart.material.opacity = this.power * 0.5;
		this.light.setIntensity(this.power * this.opts.intensity);
	},
	setColor: function(c) {
		if (typeof c == "number")
			c = zero.core.util.int2rgb(c);
		this.heart.setColor(c);
		this.light.setColor(c);
	},
	do: function(order) {
		this.setColor(order);
	},
	flicker: function() {
		var oz = this.opts;
		if (this.power && !CT.data.random(oz.invariance)) {
			this.sound("zap");
			this.light.setIntensity(0);
			setTimeout(this.setIntensity, CT.data.random(oz.flickRate * 50));
		}
		oz.flickRate && setTimeout(this.flicker, oz.flickRate * 1000);
	},
	onremove: function() {
		this.unplug();
		this.opts.flickRate = 0;
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts = oz.parts.concat([{
			name: "glass",
			sphereGeometry: 2,
			material: {
				opacity: 0.3,
				alphaTest: 0.3,
				shininess: 100,
				transparent: true,
				side: THREE.BackSide
			}
		}, {
			name: "heart",
			sphereGeometry: 1,
			material: {
				opacity: 0.5,
				alphaTest: 0.5,
				color: oz.color,
				transparent: true,
				side: THREE.BackSide
			}
		}, {
			name: "coil",
			tubeGeometry: ["spring"],
			position: [0, -2, 0],
			scale: [0.04, 0.04, 0.04],
			material: {
				shininess: 100,
				color: 0xffffff
			}
		}, {
			name: "base",
			cylinderGeometry: 1,
			position: [0, -3, 0]
		}, {
			name: "light",
			thing: "Light",
			kind: "lighting",
			variety: "point",
			color: oz.color,
			intensity: oz.intensity
		}]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, this.opts, {
			intensity: 1,
			flickRate: 4,
			invariance: 10,
			color: 0xffffaf,
			ownCircuit: true,
			timeout: 0 // for motion detection type setups
		});
		opts.flickRate && setTimeout(this.flicker, opts.flickRate * 1000);
	}
}, zero.core.Appliance);