zero.core.Fire = CT.Class({
	CLASSNAME: "zero.core.Fire",
	tickerz: ["flames", "sparks", "smoke", "glow", "moths"],
	removables: false,
	vmult: 0.1,
	tick: function(dts) {
		var zcu = zero.core.util, oz = this.opts, variety;
		if (this.quenched || !this.isReady()) return;
		if (zcu.shouldSkip()) // slow sparks look weird
			return this.sparks && this.sparks.tick(dts);
		if (!this.glow || zero.core.camera.visible(this.glow))
			for (variety of this.tickerz)
				this[variety] && this[variety].tick(dts);
		this.light && this.light.setIntensity((this.flick ? 0.4 : 0.5) + this.flicker[(this.foff + zcu.ticker) % 60]);
		this.tickPos();
		oz.faceUp && this.group.rotation.setFromQuaternion(oz.scene.getWorldQuaternion(zcu._quatter).inverse());
		if (oz.burnRate) {
			this.fuel -= oz.burnRate * dts;
			this.burner && this.burner(this.fuel / oz.fuel);
			if (this.fuel < 0) {
				this.log("ran out of fuel!");
				this.quench();
			}
		}
	},
	onremove: function() {
		this.smoke && this.smoke.undrip();
		this.sparks && this.sparks.undrip();
		this.opts.regTick && this.regTicker();
		this._audio && this._audio.pause();
		clearTimeout(this.flickerer);
		delete this._audio;
	},
	ignite: function() {
		if (this.opts.loudIgnite)
			zero.core.audio.sfx(zero.core.Fire.audio.lighter);
		this._audio.volume = 0.1;
		this.quenched = false;
		this.show();
	},
	quench: function() {
		this._audio.volume = 0;
		this.quenched = true;
		this.hide();
	},
/*	getBounder: function() {
		for (var part of ["flametips", "heart", "shine"])
			if (this[part])
				return this[part].group;
		return this.group;
	},*/
	assembled: function() {
		var r = zero.core.current.room;
		this._.built();
		this.quenched && this.quench();
		this.opts.glow && r && r.onbounded(this.glow.setBounds);
		this.opts.regTick && this.regTicker();
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
			position: [0, 10, 0],
			scale: [10, 10, 10],
			material: {
//				opacity: 0.6,
				color: 0xffff00,
				transparent: true,
				side: THREE.DoubleSide
			}
		});
		oz.heart && oz.parts.push({
			name: "heart",
			kind: "shiner",
			thing: "Bit",
			position: [0, 15, 0],
			scale: [15, 15, 15],
			material: {
//				opacity: 0.5,
				color: 0xffff00,
				transparent: true,
				side: THREE.DoubleSide
			}
		});
		oz.flametips && oz.parts.push({
			name: "flametips",
			kind: "shiner",
			thing: "Bit",
			position: [0, 30, 0],
			scale: [20, 20, 20],
			material: {
//				opacity: 0.5,
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
			sizeBound: true,
			material: {
				opacity: 0.1,
				alphaTest: 0.1,
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
			color: 0xffaaaa,
			intensity: oz.lightIntensity
		});
		oz.moths && oz.parts.push({
			within: oz.glow && "glow" || this,
			withiner: oz.glow && this,
			name: "moths",
			kind: "menagerie",
			collection: "fire",
			subclass: zero.core.Fauna.Menagerie
		});
	},
	flickeroo: function() {
		this.flick = !this.flick;
		this.flickerer = setTimeout(this.flickeroo, 100 + CT.data.random(500));
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			state: "plasma",
			flames: true,
			sparks: true,
			smoke: true,
			flametips: true,
			shine: true,
			heart: true,
			glow: true,
			light: true,
			moths: true,
			flicker: true,
			quenched: false,
			loudIgnite: false,
			lightIntensity: 1,
			burnRate: 0,
			fuel: 1000
		}, this.opts);
		this.quenched = opts.quenched;
		this.fuel = opts.fuel;
		if (opts.light) {
			this.flicker = zero.core.trig.segs(60, 0.05);
			this.foff = CT.data.random(60);
		}
		if (zero.core.Fire.audio)
			this._audio = zero.core.audio.ambience(zero.core.Fire.audio.crackle[0], 0.1, true);
		if (opts.flicker)
			this.flickerer = setTimeout(this.flickeroo);
	}
}, zero.core.Thing);