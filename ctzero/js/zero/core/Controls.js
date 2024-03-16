zero.core.Controls = CT.Class({
	CLASSNAME: "zero.core.Controls",
	_: { // configurize
		speed: {
			base: 100,
			jump: 500,
			orientation: 5
		},
		cams: {
			environmental: {
				UP: ["cut"],
				DOWN: ["cut", true],
				RIGHT: ["cut"],
				LEFT: ["cut", true]
			},
			interactive: {
				UP: ["zoom", -50],
				DOWN: ["zoom", 50],
				LEFT: ["shift", -50],
				RIGHT: ["shift", 50]
			},
			behind: { // currently using pov{} instead...
				UP: ["zoom", 50],
				DOWN: ["zoom", -50],
				LEFT: ["shift", 50],
				RIGHT: ["shift", -50]
			},
			pov: {
				UP: ["nod", 0.5],
				DOWN: ["nod", -0.5],
				LEFT: ["shake", 0.5],
				RIGHT: ["shake", -0.5]
			},
			polar: {
				UP: ["x", -1.5],
				DOWN: ["x", 1.5],
				LEFT: ["y", -1.5],
				RIGHT: ["y", 1.5]
			}
		},
		dim2polar: {
			x: "theta", y: "phi"
		},
		flats: ["x", "z"],
		structs: ["floor", "obstacle", "wall", "ramp", "boulder", "stala"],
		camdirs: ["UP", "DOWN", "LEFT", "RIGHT"],
		cdalias: {"LEFT": "q", "RIGHT": "e", "UP": "r", "DOWN": "f"},
		dirs: ["w", "s", "a", "d"],
		xlrmode: "walk", // walk|look|dance
		look: function(dir, mult, start) {
			var _ = this._, cz = _.cams, mode,
				per = camera.get("perspective"),
				zcc = zero.core.current,
				rule, val, dim, bs, bod, spr;
			if (per == zcc.person) {
				if (camera.current == "polar") {
					bod = zcc.person.body;
					rule = cz.polar[dir];
					[dim, val] = rule;
					spr = bod.springs[_.dim2polar[dim]];
					if (mult)
						spr.target += mult * val;
					else
						spr.boost = start ? val : 0;
				} else {
					mode = cz.pov;//[camera.current];
	//				if (camera.current == "pov") {
					rule = mode[dir];
					bs = zcc.person.body.springs;
					bs[rule[0]].target += rule[1] * (mult || 1);
	//				} disabled behind zoom/shift for now ... better right?
				}
			} else {
				mode = per ? cz.interactive : cz.environmental;
				rule = mode[dir];
				zero.core.camera[rule[0]](rule[1]);
			}
		},
		cam: function(dir) {
			var _ = this._, ak = _.cdalias[dir], look = _.look,
				up = () => look(dir), down = () => look(dir, null, true);
			CT.key.on(dir, up, down);
			CT.key.on(ak, up, down);
		},
		xlrometer: function() {
			var _ = this._, mover = this.mover, acfg = core.config.ctzero.camera.xlro;
			if (_.acl) return;
			_.acl = new Accelerometer();
			_.acl.addEventListener('reading', function() {
				if (_.xlrmode == "look") {
					_.look("UP", _.acl.x);
					_.look("LEFT", _.acl.y);
				} else if (_.xlrmode == "walk") {
					(Math.abs(_.acl.x) > 1) && mover(_.acl.x * acfg.x)();
					(Math.abs(_.acl.y) > 1) && mover(_.acl.y * acfg.y, "orientation")();
				} else { // dance
					// TODO! -> flop/flail around!!
				}
			});
			_.acl.start();
		},
		cadrag: function(direction, distance, dx, dy, pixelsPerSecond) {
			var _ = this._;
			dy && _.look("UP", dy / 200);
			dx && _.look("LEFT", dx / 400);
		},
		cawheel: function(pos, delta) {
			if (camera.current == "polar") {
				var watcher = zero.core.current.person.body.polar.tilter.watcher,
					wp = watcher.position();
				if (delta > 0 || wp.z > 20)
					watcher.adjust("position", "z", delta / 10, true);
			}
		},
		cazoomers: function() {
			var _ = this._, zoomIn = () => _.cawheel(null, -100),
				zoomOut = () => _.cawheel(null, 100);
			CT.key.on("PERIOD", zoomIn, zoomIn);
			CT.key.on("COMMA", zoomOut, zoomOut);
			CT.key.on("t", zoomIn, zoomIn);
			CT.key.on("g", zoomOut, zoomOut);
		},
		camouse: function() {
			var node = CT.dom.id("vnode") || CT.dom.id("ctmain");
			CT.require("CT.gesture", true);
			CT.gesture.listen("drag", node, this._.cadrag);
			CT.gesture.listen("wheel", node, this._.cawheel);
		},
		dirvec: function() {
			var _ = this._, dir = this.target.direction, downs = CT.key.downs(_.dirs);
			if (!_.dv)
				_.dv = new THREE.Vector3();
			_.dv.x = _.dv.y = _.dv.z = 0;
			downs.length && zero.core.util.dimsum(_.dv,
				downs.includes("w") && dir("front"),
				downs.includes("s") && dir("back"),
				downs.includes("a") && dir("left"),
				downs.includes("d") && dir("right"));
			return _.dv;
		}
	},
	setXLRMode: function(m) {
		this._.xlrmode = m;
	},
	setCams: function() {
		var _ = this._, cfg = core.config.ctzero.camera;
		_.cazoomers();
		_.camdirs.forEach(_.cam);
		cfg.cardboard && _.xlrometer();
		cfg.mouse && _.camouse();
	},
	wallshift: function(shift, prev_spring) {
		var target = this.target;
		prev_spring.boost = 0;
		target.opts.wall = (4 + (target.opts.wall + shift)) % 4;
		target.setBounds(true);
		this.setKeys();
	},
	placer: function(dir, amount, wallshift) {
		var _ = this._, s = this.springs[dir], target = this.target,
			wall = target.opts.wall, shifter = this.wallshift,
			forward = wallshift == 1, nxtval, shifted = this.shifted;
		return function() {
			if (wallshift) { // poster/portal
				nxtval = s.value + amount;
				if (forward) {
					if (wall < 2) {
						if (nxtval > s.bounds.max)
							return shifter(wallshift, s);
					} else if (nxtval < s.bounds.min)
						return shifter(wallshift, s);
				} else {
					if (wall > 1) {
						if (nxtval > s.bounds.max)
							return shifter(wallshift, s);
					} else if (nxtval < s.bounds.min)
						return shifter(wallshift, s);
				}
			}
			if (_.structs.includes(target.opts.kind))
				target.adjust("position", dir, amount, true); // but fix..
			else
				s.boost = shifted() ? amount * 2 : amount;
		};
	},
	face: function(vec) {
		var tar = this.target, bod = tar.body, os = bod.springs.orientation;
		os.hard = false;
		tar.orient(null, zero.core.util.dimsum(vec, bod.position()));
	},
	go: function(soft) {
		var _ = this._, springz = this.springs, vec = _.dirvec(),
			dim, speed = _.speed.base * this.target.energy.k;
		if (soft && !CT.key.downs(_.dirs).length)
			return;
		for (dim of _.flats)
			springz[dim].boost = speed * vec[dim];
		camera.isPolar && this.face(vec);
	},
	mover: function(fullAmount, dir) {
		var _ = this._, target = this.target, amount, isor,
			spr = this.springs[dir], go = this.go, moveCb = _.moveCb;
		return function(mult) {
			if (target.zombified) return;
			amount = mult ? fullAmount * mult : fullAmount;
			if (amount) {
				if (dir == "y")
					target.jump(amount);
				else
					target.go();
			} else if (!CT.key.downs(_.dirs).length)
				target.undance();
			if (dir != "y") {
				isor = dir == "orientation";
				if (isor) {
					spr.hard = target.body.grippy;
					spr.boost = amount;
				}
				go(isor);
			} else if (!amount && !spr.hard)
				target.unjump();
			moveCb && moveCb(target.name);
		};
	},
	clear: function() {
		CT.key.clear(null, true); // also clear CT.gesture when that's added...
	},
	setNum: function(num, gesture, dance, stop) {
		var target = this.target, shifted = this.shifted;
		CT.key.on(num.toString(), function() {
			if (shifted())
				stop ? target.undance() : (dance && target.dance(dance));
			else
				stop ? target.ungesture() : (gesture && target.gesture(gesture));
		});
	},
	runner: function(running) {
		var t = this.target, go = this.go;
		return function() {
			(running ? t.run : t.unrun)();
			setTimeout(() => go(true), 100); // wait for Mood.tick() to update energy k
		};
	},
	chinput: function() {
		return CT.dom.className("chat")[0].getElementsByTagName("input")[0];
	},
	activeChat: function() {
		return this.chinput()._active;
	},
	toggleChat: function() {
		var chinput = this.chinput();
		chinput._active = !chinput._active;
		chinput._active ? chinput.focus() : chinput.blur();
		chinput._active || zero.core.camera.angle("preferred");
	},
	setChat: function() {
		CT.dom.className("chat")[0] && CT.key.on("CTRL", this.toggleChat);
	},
	on: function(key, button, up, down) {
		CT.key.on(key, up, down);
		zero.core.gamepads.on(button, up, down);
	},
	shifted: function() {
		return CT.key.down("SHIFT") || zero.core.gamepads.pressed(10);
	},
	setKeys: function() {
		this.clear();
		var placer = this.placer, mover = this.mover, sz = this._.speed,
			speed = sz.base, ospeed = sz.orientation, jspeed = sz.jump,
			wall, gestures, dances, num = 0, runner = this.runner, tt,
			cam = zero.core.camera;
		tt = this.target.thruster;
		this.jump = mover(jspeed, "y");
		this.unjump = mover(0, "y");
		this.forward = mover(speed, "front");
		this.backward = mover(speed, "back");
		this.leftStrafe = mover(speed, "left");
		this.rightStrafe = mover(speed, "right");
		this.stop = mover(0);
		this.still = mover(0, "orientation");
		this.left = mover(ospeed, "orientation");
		this.right = mover(-ospeed, "orientation");
		this.holster = side => tt[this.shifted() ? "back" : "hip"](side);
		this.unholster = side => tt[this.shifted() ? "unback" : "unhip"](side);
		if (tt) { // person
			this.setChat();
			this.on("w", 12, this.stop, this.forward);
			this.on("s", 13, this.stop, this.backward);
			this.on("a", 14, this.stop, this.leftStrafe);
			this.on("d", 15, this.stop, this.rightStrafe);
			CT.key.on("z", this.still, this.left);
			CT.key.on("c", this.still, this.right);
			this.on("SPACE", 0, this.unjump, this.jump);
			this.on("SHIFT", 10, runner(), runner(true));
			CT.key.on("DASH", () => this.unholster("left"), () => this.holster("left"));
			CT.key.on("EQUALS", () => this.unholster("right"), () => this.holster("right"));
			this.on("OPEN_BRACKET", 4, () => tt.unthrust("left"), () => tt.swing("left"));
			this.on("CLOSE_BRACKET", 5, () => tt.unthrust("right"), () => tt.swing("right"));
			this.on("SEMICOLON", 6, () => tt.unkick("left"), () => tt.kick("left"));
			this.on("QUOTE", 7, () => tt.unkick("right"), () => tt.kick("right"));
			CT.key.on("p", () => cam.angle("polar"));
			CT.key.on("b", () => cam.angle("behind"));
			zero.core.gamepads.on(8, cam.toggle);
			gestures = Object.keys(this.target.opts.gestures);
			dances = Object.keys(this.target.opts.dances);
			this.setNum(0, null, null, true);
			while (num < gestures.length || num < dances.length) {
				this.setNum(num + 1, gestures[num], dances[num]);
				num += 1;
			}
		} else if (["poster", "portal", "screen", "stream"].indexOf(this.target.opts.kind) != -1) {
			CT.key.on("UP", placer("y", 0), placer("y", speed));
			CT.key.on("DOWN", placer("y", 0), placer("y", -speed));
			wall = this.target.opts.wall;
			if (wall == 0) {
				CT.key.on("LEFT", placer("x", 0), placer("x", -speed, -1));
				CT.key.on("RIGHT", placer("x", 0), placer("x", speed, 1));
			} else if (wall == 1) {
				CT.key.on("LEFT", placer("z", 0), placer("z", -speed, -1));
				CT.key.on("RIGHT", placer("z", 0), placer("z", speed, 1));
			} else if (wall == 2) {
				CT.key.on("LEFT", placer("x", 0), placer("x", speed, -1));
				CT.key.on("RIGHT", placer("x", 0), placer("x", -speed, 1));
			} else if (wall == 3) {
				CT.key.on("LEFT", placer("z", 0), placer("z", speed, -1));
				CT.key.on("RIGHT", placer("z", 0), placer("z", -speed, 1));
			}
		} else {
			CT.key.on("UP", placer("z", 0), placer("z", -speed));
			CT.key.on("DOWN", placer("z", 0), placer("z", speed));
			CT.key.on("LEFT", placer("x", 0), placer("x", -speed));
			CT.key.on("RIGHT", placer("x", 0), placer("x", speed));
		}
		CT.key.on("ENTER", this._.cb);
		this.on("x", 2, this._.cb);
	},
	setSprings: function() {
		var t = this.target;
		if (t.body) { // person
			this.springs = {
				x: t.body.springs.weave,
				y: t.body.springs.bob,
				z: t.body.springs.slide,
				orientation: t.body.springs.orientation
			};
		} else // object (furnishing/poster/portal)
			this.springs = t.springs;
	},
	setTarget: function(target, cams) {
		this.target = target;
		this.setSprings();
		this.setKeys();
		cams && this.setCams();
	},
	setCb: function(cb) {
		this._.cb = cb;
	},
	setMoveCb: function(cb) {
		this._.moveCb = cb;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			target: null,
			mode: "placement" // or pilot
		});
		opts.cb && this.setCb(opts.cb);
		opts.moveCb && this.setMoveCb(opts.moveCb);
		opts.target && this.setTarget(opts.target, opts.cams);
	}
});