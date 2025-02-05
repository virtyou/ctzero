zero.core.ar.location = {
	_: {
		coords: {
			latitude: 0,
			longitude: 0
		},
		fakeGPS: false,
		latlng: function(t) {
			var zc = zero.core, zcar = zc.ar, _ = zcar.location._, c = _.coords,
				lng = t.longitude, lat = t.latitude;
			if (zcar.aug.relative) {
				lng += c.longitude;
				lat += c.latitude;
			}
			CT.log(t.name + " at " + lng + " lng and " + lat + " lat");
			return { lat: lat, lng: lng };
		},
		placed: function(t) {
			var _ = zero.core.ar.location._, ll = _.latlng(t);
			t.adder = outerGroup => _.locar.add(outerGroup, ll.lng, ll.lat);
			return t;
		},
		thing: function(t, i) {
			var zc = zero.core, zcu = zc.util, _ = zc.ar.location._, ticker;
			if (t.kind == "swarm")
				ticker = thing => zcu.ontick(thing.tick);
			if (!t.name)
				t.name = "thing" + i;
			_.things[t.name] = zcu.thing(_.placed(t), ticker);
		},
		person: function(p) {
			var zcar = zero.core.ar, _ = zcar.location._;
			zcar.person(p.person, function(body) {
				body.longitude = p.longitude;
				body.latitude = p.latitude;
				_.placed(body);
			}, person => person.body.setCoords(0.2, "scale"));
		},
		manifestation: function(m, i) {
			var _ = zero.core.ar.location._;
			m.person ? _.person(m) : _.thing(m, i);
		},
		build: function() {
			var zcar = zero.core.ar;
			zcar.aug.things.forEach(zcar.location._.manifestation);
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