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
	},
	getTop: function() {
		return this.bounds.min.y;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			grippy: false,
			factor: 75,
			amplitude: 2,
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