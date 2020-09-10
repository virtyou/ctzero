zero.core.Fire = CT.Class({
	CLASSNAME: "zero.core.Fire",
	tick: function(dts) {
		for (var variety of ["flames", "sparks", "smoke", "glow", "light"])
			this[variety] && this[variety].tick(dts);
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
//		for (variety of ["sparks", "smoke", "glow"]) {
		for (variety of ["sparks", "smoke"]) {
			oz[variety] && oz.parts.push({
				name: variety,
				kind: "particles",
				thing: "Particles"
			});
		}
		oz.light && oz.parts.push({

		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			state: "plasma",
			flames: true,
			sparks: true,
			smoke: true,
			glow: true,
			light: false
		}, this.opts);
	}
}, zero.core.Thing);