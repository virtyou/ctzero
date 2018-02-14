var camera = zero.core.camera = {
	_: {
		profiles: {}
	},
	springs: {},
	render: function() {
		var _ = camera._;
		_.renderer.render(camera.scene, _.camera);
	},
	update: function() {
		var cam = camera._.camera;
		cam.aspect = window.innerWidth / window.innerHeight;
		cam.updateProjectionMatrix();
		camera.resize();
	},
	resize: function(w, h) {
		camera._.renderer.setSize(w || window.innerWidth, h || window.innerHeight);
		if (camera._.useControls)
			camera._.controls.handleResize();
	},
	look: function(pos) {
		camera._.camera.lookAt(pos);
	},
	follow: function(thing) {
		if (!thing)
			return camera._.subject;
		camera._.subject = thing;
	},
	tick: function() {
		if (camera._.useControls)
			camera._.controls.update();
		else {
			camera.position({
				x: camera.springs.x.value,
				y: camera.springs.y.value,
				z: camera.springs.z.value
			});
			if (camera._.subject)
				camera.look(camera._.subject.position(null, true));
		}
	},
	random: function(dimension, target, factor) {
		camera.springs[dimension].target = target + factor * Math.random();
	},
	move: function(pos) {
		zero.core.util.coords(pos, function(dim, val) {
			camera.springs[dim].target = val;
		});
	},
	position: function(pos) {
		var _ = camera._;
		if (!pos)
			return _.camera.position;
		zero.core.util.coords(pos, function(dim, val) {
			_.camera.position[dim] = val;
		});
	},
	target: function(profile) {
		if (typeof profile == "function")
			return profile();
		["position", "rotation"].forEach(function(aspect) {
			if (aspect in profile) {
				for (var dimension in profile[aspect]) {
					var pad = profile[aspect][dimension],
						target = pad.target || 0;
					if (pad.factor)
						target += pad.factor * Math.random();
					camera.springs[dimension].target = target;
				}
			}
		});
	},
	set: function(name) {
		CT.log("camera set " + name);
		var _ = camera._, profile = _.profiles[name];
		clearInterval(_.wander);
		camera.target(profile);
		if (profile.wander) {
			if (Object.keys(profile.wander).length > 1) {
				CT.log("camera.set(): specify no more than one wander interval per pattern");
				throw "only one wander interval allowed!"
			}
			for (var interval in profile.wander) // only one allowed
				_.wander = setInterval(camera.target, interval, profile.wander[interval]);
		}
	},
	register: function(name, profile) {
		camera._.profiles[name] = profile;
	},
	controls: function(useThem) {
		camera._.useControls = useThem;
		if (useThem) {
			zero.core.util.coords(camera.springs, function(dim, s) {
				camera._.controls.position0[dim] = s.value;
			});
		} else {
			zero.core.util.coords(camera._.camera.position, function(dim, val) {
				var s = camera.springs[dim];
				s.target = s.value;
				s.value = val;
			});
		}
	},
	init: function() {
		var _ = camera._, config = core.config.ctzero,
			WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
		camera.scene = new THREE.Scene();
		if (config.camera.background)
			camera.scene.background = THREE.ImageUtils.loadTexture(config.camera.background);
		_.camera = new THREE.PerspectiveCamera(25, WIDTH / HEIGHT, 0.2, 10000000);
		_.renderer = new THREE.WebGLRenderer({ antialias: true });
		_.renderer.setSize(WIDTH, HEIGHT);
		_.container = CT.dom.div(null, "abs all0");
		CT.dom.addContent(document.body, _.container);
		_.container.appendChild(_.renderer.domElement);
		_.controls = new THREE.TrackballControls(_.camera);

		for (var k in config.camera.controls)
			_.controls[k] = config.camera.controls[k];
		for (var s in config.camera.springs)
			camera.springs[s] = zero.core.springController.add(config.camera.springs[s], "camera" + s);
		for (var p in config.camera.patterns)
			camera.register(p, config.camera.patterns[p]);
		if ("initial" in config.camera.patterns)
			camera.set("initial");
		window.addEventListener("resize", camera.update, false);
	}
};