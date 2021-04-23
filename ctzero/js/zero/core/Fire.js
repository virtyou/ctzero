zero.core.Fire = CT.Class({
	CLASSNAME: "zero.core.Fire",
	tick: function(dts) {
		for (var variety of ["flames", "sparks", "smoke", "glow"])
			this[variety] && this[variety].tick(dts);
		this.light && this.light.setIntensity(0.5 + this.flicker[zero.core.util.ticker % 60]);
		this.tickPos();
	},
	onremove: function() {
		this.smoke && this.smoke.undrip();
		this.sparks && this.sparks.undrip();
		this.opts.regTick && zero.core.current.room.unregTicker(this);
	},
	assembled: function() {
		this._.built();
		this.opts.regTick && zero.core.current.room.regTicker(this);
	},
	preassemble: function() {
		var oz = this.opts, variety;
		oz.flames && oz.parts.push({
			name: "flames",
			kind: "tentacles",
			thing: "Hair",
			density: 4,
			coverage: [0.5, 0.5],
			position: [0, 0, 0],
			strand: {
				pendmap: "Phong",
				girth: 6,
				length: 6,
				segments: 4,
				wiggle: 600,
				nograv: true,
				flex: Math.PI / 8,
				taper: [0.6, 0.9, 0.6],
				material: {
					opacity: 0.4,
					color: 0xff0000,
					transparent: true
				}
			}
		});
		for (variety of ["sparks", "smoke"]) {
			oz[variety] && oz.parts.push({
				name: variety,
				kind: "particles",
				thing: "Particles"
			});
		}
		oz.shine && oz.parts.push({
			name: "shine",
			kind: "shiner",
			thing: "Bit",
			coneGeometry: true,
			position: [0, 20, 0],
			material: {
				opacity: 0.6,
				color: 0xffff00,
				transparent: true,
				side: THREE.DoubleSide
			}
		});
		oz.heart && oz.parts.push({
			name: "heart",
			kind: "shiner",
			thing: "Bit",
			position: [0, 20, 0],
			scale: [0.4, 0.4, 0.4],
			material: {
				opacity: 0.9,
				color: 0xffff00,
				transparent: true,
				side: THREE.DoubleSide
			}
		});
		oz.glow && oz.parts.push({
			name: "glow",
			kind: "pulser",
			thing: "Bit",
			pulse: 0.01,
			material: {
				opacity: 0.1,
				color: 0xff0000,
				transparent: true,
				side: THREE.BackSide
			}
		});
		oz.light && oz.parts.push({
			name: "light",
			thing: "Light",
			kind: "lighting",
			variety: "point",
			color: 0xffaaaa
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			state: "plasma",
			flames: true,
			sparks: true,
			smoke: true,
			shine: true,
			heart: true,
			glow: true,
			light: true
		}, this.opts);
		if (opts.light)
			this.flicker = zero.core.trig.segs(60, 0.05);
	}
}, zero.core.Thing);