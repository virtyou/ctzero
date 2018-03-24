zero.core.Pool = CT.Class({
	CLASSNAME: "zero.core.Pool",
	tick: function(dts) {
		var timeP = dts * this.opts.factor, i,
			geo = this.thring.geometry, vertices = geo.vertices,
			mainCam = zero.core.camera, campos = mainCam.position();
		for (i = 0; i < vertices.length; i ++)
			vertices[i].z = 2 * Math.sin(i / 2 + (timeP + i) / 5);
		geo.computeFaceNormals();
		geo.computeVertexNormals();
		geo.verticesNeedUpdate = true;
		this.cam.updateCubeMap(mainCam.get("renderer"), mainCam.scene);
		this.cam.position.y = -campos.y;//-112;
		this.cam.position.z = campos.z;//+22;
		this.cam.position.x = campos.x;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			factor: 75,
			watermat: true,
			plane: [800, 800, 22, 44],
			cam: [1, 1000000, 512],
			camPos: {
				z: -66
			}
		});
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
	}
}, zero.core.Thing);