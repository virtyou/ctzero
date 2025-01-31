zero.core.ar.location = {
	_: {
		coords: {
			latitude: 0,
			longitude: 0
		},
		thing: function(t, i) {
			var _ = zero.core.ar.location._, c = _.coords,
				name = t.name || ("thing" + i);
			_.things[name] = zero.core.util.thing(CT.merge(t, {
				name: name,
				adder: outerGroup => _.arloc.add(outerGroup,
					c.longitude + t.longitude, c.latitude + t.latitude)
			}));
		},
		build: function() {
			core.config.ctzero.camera.ar.things.forEach(zero.core.ar.location._.thing);
		},
		init: function() {
			var zcar = zero.core.ar, _ = zcar.location._, waiting = true, dobuild = function() {
				if (waiting) {
					waiting = false;
					zcar.populate("things", _.build);
				}
			}, cz = _.coords;
			_.things = {};
			_.arloc.on("gpsupdate", function(pos) {
				cz.latitude = pos.coords.latitude;
				cz.longitude = pos.coords.longitude;
				CT.log("GPS: " + cz.longitude + " lon; " + cz.latitude + " lat");
				dobuild();
			});
			_.arloc.on("gpserror", function(code) {
				CT.log("GPS error: " + code);
				dobuild();
			});
		}
	},
	tick: function() {
		var zcarlo = zc.ar.location, _ = zcarlo._;
		_.orcon.update();
	},
	build: function() {
		var zc = zero.core, cam = zc.camera, camcam = cam.get(),
			zcarlo = zc.ar.location, _ = zcarlo._;
		_.arloc = new THREEx.LocationBased(cam.scene, camcam);
		_.orcon = new THREEx.DeviceOrientationControls(camcam);
		_.lights = core.config.ctzero.camera.ar.lights.map(zero.core.util.light);
		_.init();
	},
	start: function(ar) { // probs consolidate start()s
		core.config.ctzero.camera.ar = CT.merge(ar); // avoids modding original
		zero.core.camera.init();
		requestAnimationFrame(zero.core.util.animate);
	}
};