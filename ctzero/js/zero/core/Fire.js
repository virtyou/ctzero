zero.core.Fire = CT.Class({
	CLASSNAME: "zero.core.Fire",
	tick: function(dts) {
		for (var variety of ["flames", "sparks", "smoke", "glow"])
			this[variety] && this[variety].tick(dts);
		this.light && this.light.setIntensity(0.5 + this.flicker[zero.core.util.ticker % 60]);
	},
	onremove: function() {
		this.smoke && this.smoke.undrip();
		this.sparks && this.sparks.undrip();
		zero.core.current.room.unregTicker(this);
	},
	assembled: function() { // TODO: what if fire's parent is room? revisit!!!
		this._.built();
		zero.core.current.room.regTicker(this);
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
				wiggle: 60,
				nograv: true,
				flex: Math.PI / 8,
				taper: [0.6, 0.9, 0.6],
				material: {
					opacity: 0.9,
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
		oz.glow && oz.parts.push({
			name: "glow",
			kind: "pulser",
			thing: "Bit",
			pulse: 0.01,
			material: {
				opacity: 0.2,
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
			glow: true,
			light: true
		}, this.opts);
		if (opts.light)
			this.flicker = zero.core.trig.segs(60, 0.05);
	}
}, zero.core.Thing);