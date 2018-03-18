var camera = zero.core.camera = {
	_: {
		profiles: {}
	},
	springs: {
		position: {},
		rotation: {},
		looker: {}
	},
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
		zero.core.util.coords(pos, function(dim, val) {
			camera.springs.looker[dim].target = val;
		});
	},
	follow: function(thing) {
		if (!thing)
			return camera._.subject;
		camera._.subject = thing;
	},
	perspective: function(person) {
		camera._.perspective = person;
	},
	_tickPerspective: function() {
		if (camera._.perspective)
			zero.core.util.coords(camera._.perspective.head.eyeGroupR.position(null, true),
				function(dim, val) { camera.springs.position[dim].target = val; });
	},
	_tickSubject: function() {
		if (camera._.subject) {
			var looker = camera.springs.looker;
			camera.look(camera._.subject.position(null, true));
			camera.looker({
				x: looker.x.value,
				y: looker.y.value,
				z: looker.z.value
			});
			camera._.camera.lookAt(camera._.looker.position());
		}
	},
	tick: function() {
		if (camera._.useControls)
			camera._.controls.update();
		else {
			camera._tickPerspective();
			var s = camera.springs;
			camera.position({
				x: s.position.x.value,
				y: s.position.y.value,
				z: s.position.z.value
			});
			camera._tickSubject();
		}
	},
	random: function(dimension, target, factor, aspect) {
		camera.springs[aspect || "position"][dimension].target = target + factor * Math.random();
	},
	move: function(pos) {
		zero.core.util.coords(pos, function(dim, val) {
			camera.springs.position[dim].target = val;
		});
	},
	looker: function(pos) {
		if (!pos)
			return camera._.looker.position();
		zero.core.util.coords(pos, function(dim, val) {
			camera._.looker.adjust("position", dim, val);
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
	rotate: function(rot) {
		zero.core.util.coords(rot, function(dim, val) {
			camera.springs.rotation[dim].target = val;
		});
	},
	rotation: function(rot) {
		var _ = camera._;
		if (!rot)
			return _.camera.rotation;
		zero.core.util.coords(rot, function(dim, val) {
			_.camera.rotation[dim] = val;
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
					camera.springs[aspect][dimension].target = target;
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
			zero.core.util.coords(camera.springs.position, function(dim, s) {
				camera._.controls.position0[dim] = s.value;
			});
		} else {
			zero.core.util.coords(camera._.camera.position, function(dim, val) {
				var s = camera.springs.position[dim];
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
		_.looker = new zero.core.Thing({
			name: "looker",
			geometry: new THREE.CubeGeometry(1, 1, 15),
			material: {
				color: 0x00ff00,
				visible: false
			}
		});

		for (var k in config.camera.controls)
			_.controls[k] = config.camera.controls[k];
		for (var a in config.camera.springs) {
			for (var s in config.camera.springs[a])
				camera.springs[a][s] = zero.core.springController.add(config.camera.springs[a][s], "camera" + a + s);
		}
		for (var p in config.camera.patterns)
			camera.register(p, config.camera.patterns[p]);
		if ("initial" in config.camera.patterns)
			camera.set("initial");
		window.addEventListener("resize", camera.update, false);
	}
};