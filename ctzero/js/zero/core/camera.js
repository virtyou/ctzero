var camera = zero.core.camera = {
	_: {
		ar: {},
		profiles: {},
		left: {},
		right: {},
		preferreds: ["polar", "behind"],
		lookers: {
			polar: true,
			pov: {
				y: 5,
				z: 25
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
		cam.updateProjectionMatrix && cam.updateProjectionMatrix(); // pcam only
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
		ccfg.ar && zero.core.ar.resize(_.renderer);
		if (ccfg.vr) {
			w = w / 2;
			_.left.renderer.setSize(w, h);
			_.right.renderer.setSize(w, h);
		} else
			_.renderer.setSize(w, h);
		if (_.useControls)
			_.controls.handleResize();
	},
	visible: function(obj) {
		var thring = obj.thring || (obj.vizbit && obj.vizbit()) || obj,
			t = zero.core.util.ticker, _ = camera._;
		if (!thring) return;
		if (!thring.frusted || thring.frusted < t) {
			thring.inFrustum = (_.frustum || _.left.frustum).intersectsObject(thring);
			thring.frusted = t + 30;
		}
		return thring.inFrustum;
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
		zero.core.current.room.cut(null, down === true);
		camera._.onchange && camera._.onchange();
	},
	toggle: function() {
		if (camera.current == "polar")
			camera.angle("behind");
		else
			camera.angle("polar");
	},
	angle: function(perspective, pname, lookPart, noPref) {
		console.log(perspective, pname, lookPart);
		if (perspective == "preferred")
			perspective = camera.preferred || "polar";
		var zcc = zero.core.current, _ = camera._,
			pol = camera.isPolar = perspective == "polar";
		camera.current = perspective;
		if (!noPref && _.preferreds.includes(perspective))
			camera.preferred = perspective;
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
				camera.setSprings(200);
				camera.perspective(person, lookPart || (pol && "head"));
				if (!pol) {
					var per = _.lookers[perspective],
						bl = person.body.watcher, dim;
					for (dim in per)
						bl.adjust("position", dim, per[dim]);
				}
			} else
				zcc.room.cut(parseInt(perspective));
		}
		_.onchange && _.onchange();
	},
	roomcam: function() {
		return !(camera.current in camera._.lookers);
	},
	cutifroom: function(cam) {
		camera.roomcam() && zero.core.current.room.cut(cam);
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
	unPerNonCur: function() {
		var _ = camera._;
		if ((_.perspective != zero.core.current.person) || !_.subject || (_.subject.name != "head")) {
			CT.log("camera.unPerNonCur() switching back to current person polar cam");
			camera.angle("polar");
		}
	},
	caretOn: function() {
		core.config.ctzero.camera.caret && camera._.looker.caret.show();
	},
	caretOff: function() {
		camera._.looker.caret.hide();
	},
	toggleCaret: function(isOn) {
		camera[isOn ? "caretOn" : "caretOff"]();
	},
	perspective: function(person, part) {
		camera._.perspective = person;
		camera.toggleCaret(!person || !person.isYou());
		person && camera.follow(person.body[part || "lookAt"]);
	},
	_tickPerDim: function(dim, val, prop) {
		camera.springs.position[dim][prop] = val;
	},
	_tickPerspective: function() {
		var per = camera._.perspective,
			cur = camera.current, prop, watcher;
		if (per) {
			prop = (cur == "pov") ? "value" : "target";
			watcher = (cur == "polar") ? per.body.polar.tilter.watcher : per.body.watcher;
			zero.core.util.coords(watcher.position(null, true),
				(dim, val) => camera._tickPerDim(dim, val, prop));
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
		if (core.config.ctzero.camera.ar)
			zero.core.ar.tick();
		else if (_.useControls)
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
		axes = axes || zero.core.util.xyz;
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
	setShadows: function(shouldShad) {
		camera.get("renderer").shadowMap.enabled = shouldShad && core.config.ctzero.shadows;
	},
	_cam: function(w, h, _, cclass) {
		var cfg = core.config.ctzero, camcfg = cfg.camera;
		_ = _ || camera._;
		if (camcfg.ar) {
			camcfg.opts.alpha = true;
			_.camera = new THREE.Camera();
		} else
			_.camera = new THREE.PerspectiveCamera(camcfg.fov, w / h, 0.2, 10000000);
		_.container = CT.dom.div(null, cclass || "abs all0");
		_.renderer = new THREE.WebGLRenderer(camcfg.opts);
		_.renderer.shadowMap.enabled = cfg.shadows;
		_.renderer.setSize(w, h);
		_.frustum = _.renderer.frustum;
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
		cam1.position.x = -2.8;
		cam2.position.x = 2.8;
		var keanu = new THREE.Matrix4();
		stand.lookAt = function(vec) {
			keanu.lookAt(stand.position, vec, stand.up);
			stand.quaternion.setFromRotationMatrix(keanu);
		};
		return stand;
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
			config.camera.ar && zero.core.ar.build();
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
			boxGeometry: [1, 1, 15],
			material: {
				color: 0x00ff00,
				visible: config.helpers
			},
			parts: [{
				name: "caret",
				invisible: true,
				coneGeometry: true,
				scale: [4, 4, 4],
				position: [0, 20, 0],
				rotation: [Math.PI, 0, 0],
				material: {
					color: 0x00ff00
				}
			}]
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