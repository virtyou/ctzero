zero.core.Pool = CT.Class({
	CLASSNAME: "zero.core.Pool",
	vmult: 0.1,
	tick: function(dts) {
		if (!this.thring) return; // for dynamic attachment
		var zcu = zero.core.util;
		this.creatures && this.creatures.tick(dts); // for deep water (top not visible)
		if (zcu.shouldSkip() || !zero.core.camera.visible(this)) return;
		var rate = zcu.tickRate(), smap = this.smap, t = zcu.ticker, i,
			geo = this.thring.geometry, vertices = geo.vertices, vl = vertices.length,
			mainCam, campos, max = Math.min(vl, this.cur + vl * rate);
		if (this.opts.lava)
			t = parseInt(t / 4);
		for (i = this.cur; i < max; i++)
			vertices[i].z = smap[(t + i) % 60];
		this.cur = i;
		if (i != vl) return;
		this.cur = 0;
		geo.computeFaceNormals();
		geo.computeVertexNormals();
		geo.verticesNeedUpdate = true;
		if (!this.opts.lava && !(t % 50)) {
			mainCam = zero.core.camera;
			campos = mainCam.position();
			this.cam.position.y = -campos.y - 80;
			this.cam.position.z = campos.z;//+22;
			this.cam.position.x = campos.x;
			this.cam.update(mainCam.get("renderer"), mainCam.scene);
		}
		this.bubbles && this.bubbles.tick(dts);
		this.smoke && this.smoke.tick(dts);
		this.fog && this.fog.tick(dts);
		this.glow && this.glow.setIntensity(0.6 + zero.core.trig.seg(300, 0.5));
		this.tickPos();
	},
	getTop: function() {
		return zero.core.current.room.getBounds().min.y + 1;
//		return this.bounds.min.y;
	},
	getSurface: function() {
		return this.bounds.max.y;
	},
	above: function(pos) {
		return pos.y > this.getSurface();
	},
	checkBound: function(dim, spring) {
		if (spring.bounds && spring.bounds.min > spring.bounds.max) {
			this.log("unbounding", dim);
			delete spring.bounds;
		}
	},
	onbound: function() {
		var oz = this.opts, s, side, py = this.position().y,
			rf = this.getTop(), h = py - rf, p = -h / 2;
		this.bounds.min.y = this.getTop(); // why doesn't this just happen w/ sides?
		zero.core.util.coords(this.springs, this.checkBound);
		this._.setRadMid();
		this._.setInnerBounds();
		if (oz.sides) {
			for (s in this.side) {
				side = this.side[s];
				side.adjust("scale", "y", h); // seems broken .... [too low!]
				side.adjust("position", "z", p);
				side.material.color.r = 0.6; // meh...
			}
		}
		if (this.bubbles) {
			this.bubbles.adjust("position", "z", p);
			this.bubbles.rebound();
		}
		this.glow && this.glow.adjust("position", "y", this.radii.y);
	},
	preassemble: function() {
		var oz = this.opts, xf = oz.plane[0], pg = function(x) {
			return new THREE.PlaneGeometry(x, 1);
		}, zf = oz.plane[1], xh = xf / 2, zh = zf / 2, geos = [
			pg(xf), pg(zf), pg(xf), pg(zf)
		], ph = Math.PI / 2, i, bubopts, pz = [
			[0, zh, 0],
			[xh, 0, 0],
			[0, -zh, 0],
			[-xh, 0, 0]
		], rz = [
			[ph, 0, 0],
			[ph, ph, 0],
			[ph, 0, 0],
			[ph, ph, 0]
		], partz = oz.parts, matty = CT.merge(oz.material);
		delete matty.envMap;
		matty.side = THREE.DoubleSide;
		if (oz.sides) {
			this.topDown = true;
			for (i = 0; i < 4; i++) {
				partz.push(CT.merge({
					name: "side" + i,
					kind: "side",
					material: matty,
					position: pz[i],
					rotation: rz[i],
					geometry: geos[i]
				}, core.config.ctzero.env[oz.lava ? "lava": "water"]));
			}
		}
		if (oz.bubbles) {
			bubopts = {
				bounder: this,
				name: "bubbles",
				kind: "particles",
				thing: "Particles",
				rotation: [Math.PI / 2, 0, 0]
			};
			if (oz.lava)
				bubopts.pmatColor = 0xff0000;
			partz.push(bubopts);
		}
		oz.creatures && partz.push({
			within: this,
			name: "creatures",
			kind: "menagerie",
			collection: "pool",
			rotation: [Math.PI / 2, 0, 0],
			subclass: zero.core.Fauna.Menagerie
		});
		oz.glow && partz.push({
			name: "glow",
			thing: "Light",
			kind: "lighting",
			variety: "point",
			color: oz.glow
		});
		oz.smoke && partz.push({
			name: "smoke",
			kind: "particles",
			thing: "Particles",
			size: 30,
			count: 8,
			velVariance: [10, 2, 10],
			posVariance: [200, 0, 200],
			rotation: [Math.PI / 2, 0, 0]
		});
		oz.fog && partz.push({
			name: "fog",
			kind: "particles",
			thing: "Particles",
			count: 3,
			rotation: [Math.PI / 2, 0, 0]
		});
	},
	ambience: function(sound) { // within/without
		if (!this._audios) return;
		this.log("playing", sound);
		this._audio && this._audio.pause();
		this._audio = this._audios[sound];
		zero.core.util.playMedia(this._audio);
	},
	onremove: function() {
		this._audio && this._audio.pause();
		delete this._audio;
		delete this._audios;
	},
	init: function(opts) {
		if (opts.lava) {
			opts = CT.merge(opts, {
				amplitude: 8,
				fog: true,
				smoke: true,
				watermat: false,
				creatures: false,
				glow: 0xff0000,
				plane: [800, 800, 8, 16],
				vstrip: "templates.one.vstrip.inferno"
			});
		}
		this.opts = opts = CT.merge(opts, {
			state: "liquid",
			grippy: false,
			factor: 75,
			amplitude: 2,
			sides: true,
			bubbles: true,
			watermat: true,
			creatures: true,
			fog: false,
			smoke: false,
			glow: false,
			plane: [800, 800, 22, 44],
			cam: [1, 1000000, 512],
			camPos: {
//				z: -66
			},
			pull: { bob: 600 }
		}, this.opts);
		this.cur = 0;
		this.pull = opts.pull;
		this.grippy = opts.grippy;
		if (opts.plane && !opts.geometry) {
			var p = opts.plane;
			opts.geometry = new THREE.PlaneGeometry(p[0], p[1], p[2], p[3]);
		}
		this.smap = zero.core.trig.segs(60, opts.amplitude);
		if (opts.lava) return this.log("skipping cam stuff for lava");
		if (opts.watermat) {
			opts.material = CT.merge(opts.material, {
				transparent: true,
				color: 0xccccff,
				opacity: 0.92,
				reflectivity: 0.87
			});
		}
		var c = opts.cam,
			cubeCam = this.cam = new THREE.CubeCamera(c[0], c[1], c[2]);
		zero.core.util.update(opts.camPos, cubeCam.position);
		opts.material.envMap = this.cam.renderTarget.texture;
		var PA = zero.core.Pool.audio;
		if (PA) {
			this._audios = {
				within: zero.core.audio.ambience(PA.within, 0.1),
				without: zero.core.audio.ambience(PA.without, 0.1, true)
			};
			this._audio = this._audios.without;
		}
	}
}, zero.core.Thing);