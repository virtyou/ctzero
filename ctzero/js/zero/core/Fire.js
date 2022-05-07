zero.core.Fire = CT.Class({
	CLASSNAME: "zero.core.Fire",
	tickerz: ["flames", "sparks", "smoke", "glow", "moths"],
	removables: false,
	tick: function(dts) {
		var zcu = zero.core.util, variety;
		if (!this.isReady() || zcu.shouldSkip()) return;
		if (!this.glow || zero.core.camera.visible(this.glow))
			for (variety of this.tickerz)
				this[variety] && this[variety].tick(dts);
		this.light && this.light.setIntensity(0.5 + this.flicker[zcu.ticker % 60]);
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
			scale: [20, 20, 20],
			material: {
				opacity: 0.5,
				color: 0xffff00,
				transparent: true,
				side: THREE.DoubleSide
			}
		});
		oz.glow && oz.parts.push({
			name: "glow",
			kind: "pulser",
			thing: "Bit",
			pulse: 0.2,
			size: 40,
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
		oz.moths && oz.parts.push({
			within: this,
			name: "moths",
			kind: "menagerie",
			collection: "fire",
			subclass: zero.core.Fauna.Menagerie
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
			light: true,
			moths: true
		}, this.opts);
		if (opts.light)
			this.flicker = zero.core.trig.segs(60, 0.05);
		if (zero.core.Fire.audio) {
			this._audio = CT.dom.audio();
			this._audio.loop = true;
			document.body.appendChild(this._audio);
			this._audio.src = zero.core.Fire.audio.crackle[0];
			zero.core.util.playMedia(this._audio);
		}
	}
}, zero.core.Thing);