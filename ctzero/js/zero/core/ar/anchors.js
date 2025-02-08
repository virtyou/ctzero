zero.core.ar.anchors = {
	_: {},
	markers: {
		entity: function(thopts, thextra, onready) {
			var zc = zero.core, zcu = zc.util, zcar = zc.ar;
			if (thopts.person) {
				return zcar.person(thopts.person, function(body) {
					body.nogo = true;
				}, onready);
			}
			zcu.thing(CT.merge({
				centered: true, // for bound/fit
				scale: [1, 1, 1],
				position: [0, 0, 0],
				onbound: zcu.fit
			}, thopts, thextra), onready);
		},
		marker: function(marker, thopts) {
			var zc = zero.core, zcu = zc.util, zcar = zc.ar, tbg,
				zcan = zcar.anchors, amarx = zcan.markers, _ = zcan._;
			amarx.entity(thopts, {
				name: thopts.kind + marker
			}, function(thing) {
				_.things[marker] = thing;
				CT.log(thing.name + " on " + marker);
				mopts = {};// changeMatrixMode: "cameraTransformMatrix" };
				if (isNaN(parseInt(marker))) {
					mopts.type = "pattern";
					mopts.patternUrl = "/ardata/patt." + marker;
				} else {
					mopts.type = "barcode";
					mopts.barcodeValue = parseInt(marker);
				}
				if (thing.body) {
					tbg = thing.body.group;
					tbg.rotation.x = Math.PI * 9 / 8;
					thing.body.setCoords(0.05, "scale", false, tbg);
				} else if (!["video", "program"].includes(thopts.kind)) {
					zcu.fit(thing);
					(thopts.kind == "swarm") && zcu.ontick(thing.tick);
				}
				_.markers[marker] = new THREEx.ArMarkerControls(_.context,
					thing.body ? thing.body.placer : thing.group, mopts);
			});
		},
		build: function() {
			var mcfg = core.config.ctzero.camera.ar.markers, m;
			CT.log("loading " + Object.keys(mcfg));
			for (m in mcfg)
				zero.core.ar.anchors.markers.marker(m, mcfg[m]);
		},
		init: function() {
			var zcar = zero.core.ar, zcan = zcar.anchors, _ = zcan._;
			_.markers = {};
			_.things = {};
			zcar.populate("markers", zcan.markers.build);
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
	}
};