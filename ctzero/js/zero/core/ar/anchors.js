zero.core.ar.anchors = {
	_: {},
	markers: {
		marker: function(marker, thopts) {
			var _ = zero.core.ar.anchors._, mopts, thing = _.things[marker] = zero.core.util.thing(CT.merge({
				centered: true, // for bound/fit
				scale: [1, 1, 1],
				position: [0, 0, 0],
				onbound: zero.core.util.fit
			}, thopts, {
				name: thopts.kind + marker
			}), function() {
				mopts = {};// changeMatrixMode: "cameraTransformMatrix" };
				if (isNaN(parseInt(marker))) {
					mopts.type = "pattern";
					mopts.patternUrl = "/ardata/patt." + marker;
				} else {
					mopts.type = "barcode";
					mopts.barcodeValue = parseInt(marker);
				}
				if (thopts.kind != "video") {
					zero.core.util.fit(thing);
					(thopts.kind == "swarm") && zero.core.util.ontick(thing.tick);
				}
				_.markers[marker] = new THREEx.ArMarkerControls(_.context, thing.group, mopts);
			});
		},
		build: function() {
			var mcfg = core.config.ctzero.camera.ar.markers, m;
			for (m in mcfg)
				zero.core.ar.anchors.markers.marker(m, mcfg[m]);
		},
		init: function() {
			var zcar = zero.core.ar.anchors, _ = zcar._,
				mcfg = core.config.ctzero.camera.ar.markers, m,
				keys = Object.values(mcfg).filter(i => typeof i == "string");
			_.markers = {};
			_.things = {};
			if (!keys.length)
				return zcar.markers.build();
			CT.db.multi(keys, function(things) {
				things.forEach(function(thing) {
					for (m in mcfg)
						if (mcfg[m] == thing.key)
							mcfg[m] = thing;
				});
				zcar.markers.build();
				CT.cc.views(zcar.components());
			}, "json");
		}
	},
	build: function() {
		var zcar = zero.core.ar.anchors, _ = zcar._, cam = zero.core.camera;
		_.source = new THREEx.ArToolkitSource({
			sourceType: "webcam"
		});
		_.context = new THREEx.ArToolkitContext({
			cameraParametersUrl: "/ardata/camera_para.dat",
			detectionMode: "mono_and_matrix",
			matrixCodeType: "3x3_HAMMING63",
			maxDetectionRate: 30
		});
		zcar.markers.init();
		_.lights = core.config.ctzero.camera.ar.lights.map(zero.core.util.light);
		_.source.init(() => setTimeout(cam.update, 200));
		_.context.init(function() {
			cam.get().projectionMatrix.copy(_.context.getProjectionMatrix());
		});
	},
	tick: function() {
		var _ = zero.core.ar.anchors._;
		if (!_.source.ready) return;
		_.context.update(_.source.domElement);
	},
	resize: function(renderer) {
		var _ = zero.core.ar.anchors._;
		_.source.onResizeElement();
		_.source.copyElementSizeTo(renderer.domElement);
		_.context.arController && _.source.copyElementSizeTo(_.context.arController.canvas);
	},
	components: function() {
		var aug = core.config.ctzero.camera.ar, compz = [{
			identifier: "Augmentation: " + aug.name,
			owners: aug.owners
		}];
		Object.values(aug.markers).forEach(function(thing) {
			compz = compz.concat(zero.core.util.components(thing, aug.name));
		});
		return compz;
	},
	start: function(ar) {
		core.config.ctzero.camera.ar = CT.merge(ar); // avoids modding original
		zero.core.camera.init();
		requestAnimationFrame(zero.core.util.animate);
	}
};