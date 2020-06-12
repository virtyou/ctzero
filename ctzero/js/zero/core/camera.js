var camera = zero.core.camera = {
	_: {
		profiles: {},
		lookers: {
			pov: {
				y: 5,
				z: 15
			},
			behind: {
				y: 85,
				z: -155
			},
			front: {
				y: 25,
				z: 115
			}
		}
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
		var cam = camera._.camera, cont = camera._.outerContainer;
		cam.aspect = cont.clientWidth / cont.clientHeight;
		cam.updateProjectionMatrix();
		camera.resize();
	},
	resize: function(w, h) {
		var cont = camera._.outerContainer;
		camera._.renderer.setSize(w || cont.clientWidth, h || cont.clientHeight);
		if (camera._.useControls)
			camera._.controls.handleResize();
	},
	cycle: function() {
		var _ = camera._;
		if (_.cycler) {
			clearInterval(_.cycler);
			delete _.cycler;
		} else {
			_.cycler = setInterval(camera.cut, 3000);
			return true;
		}
	},
	cyclabel: function() {
		return camera._.cycler ? "stop cycling" : "cycle";
	},
	onchange: function(cb) {
		camera._.onchange = cb;
	},
	cut: function(down) {
		camera.current = zero.core.current.room.cut(null, down === true);
		camera._.onchange && camera._.onchange();
	},
	angle: function(perspective, pname, lookPart) {
		console.log(perspective, pname, lookPart);
		var zcc = zero.core.current, _ = camera._;
		camera.current = perspective;
		if (pname)
			camera.current += " (" + pname + ")";
		if (perspective == "cycle" || perspective == "stop cycling")
			camera.cycle();
		else {
			if (camera._.cycler) {
				clearInterval(camera._.cycler);
				delete camera._.cycler;
			}
			if (perspective in _.lookers) {
				var person = zcc.people[pname] || zcc.person;
				if (!person) return;
				var per = _.lookers[perspective],
					bl = person.body.watcher, dim;
				camera.setSprings(200);
				camera.perspective(person, lookPart);
				for (dim in per)
					bl.adjust("position", dim, per[dim]);
			} else
				zcc.room.cut(parseInt(perspective));
		}
		_.onchange && _.onchange();
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
	unfollow: function() {
		camera._.subject = null;
	},
	adjust: function(axis, diff) {
		var p = camera._.perspective;
		if (!p) return CT.log("camera.adjust(): no perspective!");
		p.body.watcher.adjust("position", axis, diff, true);
	},
	zoom: function(diff) {
		camera.adjust("z", diff);
	},
	shift: function(diff) {
		camera.adjust("x", diff);
	},
	perspective: function(person, part) {
		camera._.perspective = person;
		person && camera.follow(person.body[part || "lookAt"]);
	},
	_tickPerspective: function() {
		if (camera._.perspective)
			zero.core.util.coords(camera._.perspective.body.watcher.position(null, true),
				function(dim, val) { camera.springs.position[dim].target = val; });
	},
	_tickSubject: function() {
		var looker = camera.springs.looker;
		camera.look(camera._.subject.position(null, true));
		camera.looker({
			x: looker.x.value,
			y: looker.y.value,
			z: looker.z.value
		});
		camera._.camera.lookAt(camera._.looker.position(null, true));
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
			if (camera._.subject)
				camera._tickSubject();
			else {
				camera.rotation({
					x: s.rotation.x.value,
					y: s.rotation.y.value,
					z: s.rotation.z.value
				});
			}
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
	get: function(which) {
		return camera._[which || "camera"];
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
	setSprings: function(val, prop, which, axes) {
		prop = prop || "k";
		which = which || "position";
		axes = axes || ["x", "y", "z"];
		axes.forEach(function(dim) {
			camera.springs[which][dim][prop] = val;
		});
	},
	width: function(dist) {
		return camera.height(dist) * camera._.camera.aspect;
	},
	height: function(dist) {
		var w = (CT.dom.id(core.config.ctzero.container) || document.body).clientHeight,
			fov = THREE.Math.degToRad(camera._.camera.fov);
		return 2 * Math.tan(fov / 2) * dist;
	},
	background: function(bg) {
		if (bg)
			zero.core.camera.scene.background = THREE.ImageUtils.loadTexture(bg);
		else
			delete zero.core.camera.scene.background;
	},
	container: function() {
		return zero.core.camera._.outerContainer;
	},
	init: function() {
		var _ = camera._, config = core.config.ctzero, controls = !config.camera.noControls;
		camera.scene = new THREE.Scene();
		if (config.camera.background)
			camera.background(config.camera.background);
		_.container = CT.dom.div(null, "abs all0");
		var c = _.outerContainer = CT.dom.id(config.container) || document.body,
			WIDTH = c.clientWidth, HEIGHT = c.clientHeight;
		_.camera = new THREE.PerspectiveCamera(25, WIDTH / HEIGHT, 0.2, 10000000);
		camera.scene.add(_.camera);
		_.renderer = new THREE.WebGLRenderer(config.camera.opts);
		_.renderer.setSize(WIDTH, HEIGHT);
		CT.dom.addContent(_.outerContainer, _.container);
		_.container.appendChild(_.renderer.domElement);
		if (controls)
			_.controls = new THREE.TrackballControls(_.camera);
		_.looker = new zero.core.Thing({
			name: "looker",
			geometry: new THREE.CubeGeometry(1, 1, 15),
			material: {
				color: 0x00ff00,
				visible: false
			}
		});

		if (controls)
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