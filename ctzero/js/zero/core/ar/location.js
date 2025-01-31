zero.core.ar.location = {
	_: {
		coords: {
			latitude: 0,
			longitude: 0
		},
		fakeGPS: true,
		thing: function(t, i) {
			var _ = zero.core.ar.location._, c = _.coords,
				lng = c.longitude + t.longitude, lat = c.latitude + t.latitude,
				name = t.name || ("thing" + i);
			CT.log(name + " at " + lng + " lng and " + lat + " lat");
			_.things[name] = zero.core.util.thing(CT.merge(t, {
				name: name,
				adder: outerGroup => _.locar.add(outerGroup, lng, lat)
			}));
		},
		build: function() {
			core.config.ctzero.camera.ar.things.forEach(zero.core.ar.location._.thing);
		},
		gps: function(dobuild) {
			var zcar = zero.core.ar, _ = zcar.location._, cz = _.coords;
			if (_.fakeGPS) {
				_.locar.fakeGps(cz.longitude, cz.latitude);
				dobuild();
			} else {
				_.locar.on("gpsupdate", function(pos) {
					cz.latitude = pos.coords.latitude;
					cz.longitude = pos.coords.longitude;
					CT.log("GPS: " + cz.longitude + " lon; " + cz.latitude + " lat");
					dobuild();
				});
				_.locar.on("gpserror", function(code) {
					CT.log("GPS error: " + code);
					dobuild();
				});
				_.locar.startGps();
			}
		},
		init: function() {
			var zcar = zero.core.ar, _ = zcar.location._, waiting = true;
			_.things = {};
			_.gps(function() {
				if (waiting) {
					waiting = false;
					zcar.populate("things", _.build);
				}
			});
		}
	},
	tick: function() {
		var zcarlo = zc.ar.location, _ = zcarlo._;
		_.orcon.update();
		_.cam.update();
	},
	build: function() {
		var zc = zero.core, cam = zc.camera, camcam = cam.get(),
			zcarlo = zc.ar.location, _ = zcarlo._;
		_.locar = new THREEx.LocationBased(cam.scene, camcam);
		_.orcon = new THREEx.DeviceOrientationControls(camcam);
		_.cam = new THREEx.WebcamRenderer(cam.get("renderer"));
		_.lights = core.config.ctzero.camera.ar.lights.map(zero.core.util.light);
		_.init();
	},
	start: function(ar) { // probs consolidate start()s
		core.config.ctzero.camera.ar = CT.merge(ar); // avoids modding original
		zero.core.camera.init();
		requestAnimationFrame(zero.core.util.animate);
	}
};