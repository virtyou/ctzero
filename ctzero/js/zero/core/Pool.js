zero.core.Pool = CT.Class({
	CLASSNAME: "zero.core.Pool",
	tick: function(dts) {
		if (!this.thring) return; // for dynamic attachment
		var smap = this.smap, t = zero.core.util.ticker, i,
			geo = this.thring.geometry, vertices = geo.vertices,
			mainCam = zero.core.camera, campos = mainCam.position();
		for (i = 0; i < vertices.length; i ++)
			vertices[i].z = smap[(t + i) % 60];
		geo.computeFaceNormals();
		geo.computeVertexNormals();
		geo.verticesNeedUpdate = true;
		this.cam.updateCubeMap(mainCam.get("renderer"), mainCam.scene);
		this.cam.position.y = -campos.y - 80;
		this.cam.position.z = campos.z;//+22;
		this.cam.position.x = campos.x;
		this.bubbles && this.bubbles.tick(dts);
	},
	getTop: function() {
		return zero.core.current.room.bounds.min.y + 1;
//		return this.bounds.min.y;
	},
	getSurface: function() {
		return this.bounds.max.y;
	},
	above: function(pos) {
		return pos.y > this.getSurface();
	},
	onbound: function() {
		var oz = this.opts, s, side, py = this.position().y,
			rf = this.getTop(), h = py - rf, p = -h / 2;
		this.bounds.min.y = this.getTop(); // why doesn't this just happen w/ sides?
		if (oz.sides) {
			for (s in this.side) {
				side = this.side[s];
				side.adjust("scale", "y", h);
				side.adjust("position", "z", p);
				side.material.color.r = 0.6; // meh...
			}
		}
		if (this.bubbles) {
			this.bubbles.adjust("position", "z", p);
			this.bubbles.rebound();
		}
	},
	preassemble: function() {
		var oz = this.opts, partz = oz.parts,
			ph = Math.PI / 2, i,
			xf = oz.plane[0], zf = oz.plane[1],
			xh = xf / 2, zh = zf / 2, pg = function(x) {
				return new THREE.PlaneGeometry(x, 1);
			}, geos = [
				pg(xf), pg(zf), pg(xf), pg(zf)
			], pz = [
				[0, zh, 0],
				[xh, 0, 0],
				[0, -zh, 0],
				[-xh, 0, 0]
			], rz = [
				[ph, 0, 0],
				[ph, ph, 0],
				[ph, 0, 0],
				[ph, ph, 0]
			], matty = CT.merge(oz.material);
		delete matty.envMap;
		matty.side = THREE.DoubleSide;
		if (oz.sides) {
			for (i = 0; i < 4; i++) {
				partz.push({
					name: "side" + i,
					kind: "side",
					material: matty,
					position: pz[i],
					rotation: rz[i],
					geometry: geos[i]
				});
			}
		}
		oz.bubbles && partz.push({
			name: "bubbles",
			kind: "particles",
			thing: "Particles",
			bounder: this,
			rotation: [Math.PI / 2, 0, 0]
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			state: "liquid",
			grippy: false,
			factor: 75,
			amplitude: 2,
			sides: true,
			bubbles: true,
			watermat: true,
			plane: [800, 800, 22, 44],
			cam: [1, 1000000, 512],
			camPos: {
//				z: -66
			},
			pull: { bob: 600 }
		}, this.opts);
		this.pull = opts.pull;
		this.grippy = opts.grippy;
		if (opts.plane && !opts.geometry) {
			var p = opts.plane;
			opts.geometry = new THREE.PlaneGeometry(p[0], p[1], p[2], p[3]);
		}
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
		opts.material.envMap = this.cam.renderTarget;
		this.smap = zero.core.trig.segs(60, opts.amplitude);
	}
}, zero.core.Thing);