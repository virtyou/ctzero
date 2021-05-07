var camera = zero.core.camera = {
	_: {
		ar: {},
		profiles: {},
		left: {},
		right: {},
		lookers: {
			pov: {
				y: 5,
				z: 40
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
		if (core.config.ctzero.camera.vr) {
			_.left.renderer.render(camera.scene, _.left.camera);
			_.right.renderer.render(camera.scene, _.right.camera);
		} else
			_.renderer.render(camera.scene, _.camera);
	},
	aspect: function(ratio, cam) {
		cam.aspect = ratio;
		cam.updateProjectionMatrix();
	},
	update: function() {
		var _ = camera._, cont = _.outerContainer,
			ratio = cont.clientWidth / cont.clientHeight;
		if (core.config.ctzero.camera.vr) {
			ratio = ratio / 2;
			camera.aspect(ratio, _.left.camera);
			camera.aspect(ratio, _.right.camera);
			_.camera.aspect = ratio; // for width() etc
		} else
			camera.aspect(ratio, _.camera);
		camera.resize();
	},
	resize: function(w, h) {
		var _ = camera._, cont = _.outerContainer,
			ccfg = core.config.ctzero.camera;
		w = w || cont.clientWidth;
		h = h || cont.clientHeight;
		if (ccfg.ar) {
			_.ar.source.onResizeElement();
			_.ar.source.copyElementSizeTo(_.renderer.domElement);
			_.ar.context.arController && _.ar.source.copyElementSizeTo(_.ar.context.arController.canvas);
		} else if (ccfg.vr) {
			w = w / 2;
			_.left.renderer.setSize(w, h);
			_.right.renderer.setSize(w, h);
		} else
			_.renderer.setSize(w, h);
		if (_.useControls)
			_.controls.handleResize();
	},
	upsprings: function(opts) {
		var o, s, sz = this.springs.position;
		for (s in sz)
			for (o in opts)
				sz[s][o] = opts[o];
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
		var prop = (camera.current == "pov") ? "value" : "target";
		zero.core.util.coords(pos, function(dim, val) {
			camera.springs.looker[dim][prop] = val;
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
		if (camera._.perspective) {
			var prop = (camera.current == "pov") ? "value" : "target";
			zero.core.util.coords(camera._.perspective.body.watcher.position(null, true),
				function(dim, val) { camera.springs.position[dim][prop] = val; });
		}
	},
	_tickSubject: function() {
		var _ = camera._, looker = camera.springs.looker;
		if (!_.looker.placer)
			return CT.log("camera._tickSubject(): aborting - no looker placer");
		camera.look(_.subject.position(null, true));
		camera.looker({
			x: looker.x.value,
			y: looker.y.value,
			z: looker.z.value
		});
		_.camera.lookAt(_.looker.position(null, true));
	},
	tick: function() {
		var _ = camera._;
		if (core.config.ctzero.camera.ar) {
			if (!_.ar.source.ready) return;
			_.ar.context.update(_.ar.source.domElement);
//			camera.scene.visible = _.camera.visible;
		} else if (_.useControls)
			_.controls.update();
		else {
			camera._tickPerspective();
			var s = camera.springs;
			camera.position({
				x: s.position.x.value,
				y: s.position.y.value,
				z: s.position.z.value
			});
			if (_.subject)
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
	_cam: function(w, h, _, cclass) {
		var camcfg = core.config.ctzero.camera;
		_ = _ || camera._;
		_.container = CT.dom.div(null, cclass || "abs all0");
		_.camera = new THREE.PerspectiveCamera(camcfg.fov, w / h, 0.2, 10000000);
		if (camcfg.ar)
			camcfg.opts.alpha = true;
		_.renderer = new THREE.WebGLRenderer(camcfg.opts);
		_.renderer.setSize(w, h);
		_.container.appendChild(_.renderer.domElement);
		_.camera.container = _.container;
		return _.camera;
	},
	_stand: function(cam1, cam2, aspect) {
		var stand = camera._.camera = new THREE.Object3D();
		stand.fov = core.config.ctzero.camera.fov; // for height()
		stand.aspect = aspect;
		stand.add(cam1);
		stand.add(cam2);
		cam1.position.x = -10;
		cam2.position.x = 10;
		var keanu = new THREE.Matrix4();
		stand.lookAt = function(vec) {
			keanu.lookAt(stand.position, vec, stand.up);
			stand.quaternion.setFromRotationMatrix(keanu);
		};
		return stand;
	},
	_initMarker: function(marker, thopts) {
		var a = camera._.ar, mopts, thing = a.things[marker] = zero.core.util.thing(thopts, function() {
			mopts = { changeMatrixMode: "cameraTransformMatrix" };
			if (isNaN(parseInt(marker))) {
				mopts.type = "pattern";
				mopts.patternUrl = "/ardata/patt." + marker;
			} else {
				mopts.type = "barcode";
				mopts.barcodeValue = parseInt(marker);
			}
			a.markers[marker] = new THREEx.ArMarkerControls(a.context, thing.group, mopts);
		});
	},
	_initMarkers: function() {
		var acfg = core.config.ctzero.camera.ar, m;
		camera._.ar.light = zero.core.util.thing({
			kind: "light",
			thing: "Light",
			variety: "ambient"
		});
		for (m in acfg)
			camera._initMarker(m, acfg[m]);
	},
	initMarkers: function() {
		var _ = camera._, acfg = core.config.ctzero.camera.ar, m,
			keys = Object.values(acfg).filter(i => typeof i == "string");
		_.ar.markers = {};
		_.ar.things = {};
		if (!keys.length)
			return camera._initMarkers();
		CT.db.multi(keys, function(things) {
			things.forEach(function(thing) {
				for (m in acfg)
					if (acfg[m] == thing.key)
						acfg[m] = thing;
			});
			camera._initMarkers();
		}, "json");
	},
	initAR: function() {
		var _ = camera._;
//		camera.scene.visible = false;
		_.ar.source = new THREEx.ArToolkitSource({
			sourceType: "webcam"
		});
		_.ar.context = new THREEx.ArToolkitContext({
			cameraParametersUrl: "/ardata/camera_para.dat",
			detectionMode: "mono_and_matrix",
			matrixCodeType: "3x3_HAMMING63",
			maxDetectionRate: 30
		});
		camera.initMarkers();
		_.ar.source.init(() => setTimeout(camera.resize, 200));
		_.ar.context.init(function() {
			_.camera.projectionMatrix.copy(_.ar.context.getProjectionMatrix());
		});
	},
	initCam: function() {
		var _ = camera._, config = core.config.ctzero,
			c = _.outerContainer = CT.dom.id(config.container) || document.body,
			WIDTH = c.clientWidth, HEIGHT = c.clientHeight, c1, c2, cam;
		if (config.camera.vr) {
			WIDTH = WIDTH / 2;
			c1 = camera._cam(WIDTH, HEIGHT, _.left, "abs lefthalf");
			c2 = camera._cam(WIDTH, HEIGHT, _.right, "abs righthalf");
			camera.scene.add(camera._stand(c1, c2, WIDTH / HEIGHT));
			CT.dom.addContent(_.outerContainer, c1.container);
			CT.dom.addContent(_.outerContainer, c2.container);
		} else {
			cam = camera._cam(WIDTH, HEIGHT);
			camera.scene.add(cam);
			CT.dom.addContent(_.outerContainer, cam.container);
			config.camera.ar && this.initAR();
		}
	},
	init: function() {
		var _ = camera._, config = core.config.ctzero, controls = !config.camera.noControls;
		camera.scene = new THREE.Scene();
		camera.initCam();
		if (config.camera.background)
			camera.background(config.camera.background);
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