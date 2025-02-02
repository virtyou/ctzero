zero.core.ar.location = {
	_: {
		coords: {
			latitude: 0,
			longitude: 0
		},
		fakeGPS: false,
		thing: function(t, i) {
			var zc = zero.core, zcar = zc.ar, _ = zcar.location._, c = _.coords,
				lng = t.longitude, lat = t.latitude, name = t.name || ("thing" + i);
			if (zcar.aug.relative) {
				lng += c.longitude;
				lat += c.latitude;
			}
			CT.log(name + " at " + lng + " lng and " + lat + " lat");
			_.things[name] = zc.util.thing(CT.merge(t, {
				name: name,
				adder: outerGroup => _.locar.add(outerGroup, lng, lat)
			}));
		},
		build: function() {
			var zcar = zero.core.ar;
			zcar.aug.things.forEach(zcar.location._.thing);
		},
		gps: function(dobuild) {
			var zcar = zero.core.ar, _ = zcar.location._, cz = _.coords;
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
			CT.log("starting GPS - fake: " + _.fakeGPS);
			if (_.fakeGPS)
				_.locar.fakeGps(cz.longitude, cz.latitude);
			else
				_.locar.startGps();
		},
		init: function() {
			var zcar = zero.core.ar, _ = zcar.location._, starting = true;
			_.things = {};
			_.gps(function() {
				if (starting) {
					starting = false;
					zcar.populate("things", _.build);
				}
			});
		}
	},
	tick: function() {
		var zcarlo = zc.ar.location, _ = zcarlo._;
		_.orcon && _.orcon.update();
		_.cam.update();
	},
	build: function() {
		var zc = zero.core, cam = zc.camera, camcam = cam.get(),
			zcar = zc.ar, zcarlo = zcar.location, _ = zcarlo._;
		_.locar = new THREEx.LocationBased(cam.scene, camcam);
		_.cam = new THREEx.WebcamRenderer(cam.get("renderer"));
		if (CT.info.mobile)
			_.orcon = new THREEx.DeviceOrientationControls(camcam);
		_.lights = zcar.aug.lights.map(zero.core.util.light);
		_.init();
	}
};