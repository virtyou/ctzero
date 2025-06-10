// probs move elsewhere
CT.require("CT.gesture");
CT.gesture.setJoy(true);
CT.gesture.setThreshold("tap", "maxCount", 1);

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
		elecs: ["panel", "bulb", "gate", "elevator", "computer"],
		camdirs: ["UP", "DOWN", "LEFT", "RIGHT"],
		cdalias: {"LEFT": "q", "RIGHT": "e", "UP": "r", "DOWN": "f"},
		dirs: ["w", "s", "a", "d"],
		gpdirs: [12, 13, 14, 15],
		gpdir: {},
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
		xygo: function(x, y) {
			var _ = this._, gpd = _.gpdir, d = 10;
			if (x > d) {
				gpd.strafe = "right";
				this.rightStrafe(x);
			} else if (x < -d) {
				gpd.strafe = "left";
				this.leftStrafe(-x);
			} else
				gpd.strafe = false;
			if (y < -d) {
				gpd.drive = "forward";
				this.forward(-y);
			} else if (y > d) {
				gpd.drive = "backward";
				this.backward(y);
			} else
				gpd.drive = false;
			this.gpgoing = gpd.drive || gpd.strafe;
			this.gpgoing || this.stop();
		},
		cajoy: function(dx, dy, startPos, lastPos) {
//			this.log("cajoy", dx, dy, startPos, lastPos);
			var _ = this._, d = 10, fast,
				caco = zero.core.camera.container();
			if (startPos.y < caco.clientHeight / 2) {
				dy && _.look("UP", dy / 1200);
				dx && _.look("LEFT", dx / 1200);
			} else if (this.target.thruster) { // person
				fast = Math.max(Math.abs(dx), Math.abs(dy)) >= 30;
				this.target[fast ? "run" : "unrun"]();
				_.xygo(dx, dy);
			} else {
				if (dx < -d)
					CT.key.trig("LEFT", true);
				else if (dx > d)
					CT.key.trig("RIGHT", true);
				else {
					CT.key.trig("LEFT");
					CT.key.trig("RIGHT");
				}
				if (dy < -d)
					CT.key.trig("UP", true);
				else if (dy > d)
					CT.key.trig("DOWN", true);
				else {
					CT.key.trig("UP");
					CT.key.trig("DOWN");
				}
			}
		},
		cadrag: function(direction, distance, dx, dy, pixelsPerSecond) { // depped - now using cajoy()
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
		capinch: function(diff, inner, outer) {
			if (diff > 0.2)
				inner();
			else if (diff < -0.2)
				outer();
		},
		caswipe: function(direction, distance, dx, dy, pixelsPerSecond, v) {
			var _ = this._, caco = zero.core.camera.container(), checker;
			if (direction == "down")
				_.crawling = true;
			else if (direction == "up") {
				if (_.crawling)
					_.crawling = false;
				else {
					this.jump();
					setTimeout(this.unjump, 500);
				}
			} else { // right/left
				checker = () => v.startPos.y < caco.clientHeight / 2;
				this.holster(direction, checker);
				this.setTimeout(this.unholster, 500, direction, checker);
			}
		},
		cazoomers: function() {
			var _ = this._, zoomIn = () => _.cawheel(null, -300),
				zoomOut = () => _.cawheel(null, 300);
			this.on("t", 1, zoomIn, zoomIn);
			this.on("g", 3, zoomOut, zoomOut);
			CT.key.on("PERIOD", zoomIn, zoomIn);
			CT.key.on("COMMA", zoomOut, zoomOut);
			CT.gesture.listen("pinch", CT.dom.id("vnode") || CT.dom.id("ctmain"),
				(d, m) => _.capinch(d - 1, () => _.cawheel(null, -30),
					() => _.cawheel(null, 30)));
		},
		camouse: function() {
			var node = CT.dom.id("vnode") || CT.dom.id("ctmain");
			CT.gesture.listen("wheel", node, this._.cawheel);
			CT.gesture.listen("swipe", node, this._.caswipe);
			CT.gesture.listen("joy", node, this._.cajoy);
		},
		movers: {
			forward: {
				key: "w",
				button: 12,
				axis: "drive"
			},
			backward: {
				key: "s",
				button: 13,
				axis: "drive"
			},
			left: {
				key: "a",
				axis: "strafe"
			},
			right: {
				key: "d",
				axis: "strafe"
			}
		},
		moving: function(dir) {
			var _ = this._, dopts = _.movers[dir];
			if (dopts.button && zero.core.gamepads.pressed(dopts.button))
				return true;
			return CT.key.down(dopts.key) || _.gpdir[dopts.axis] == dir;
		},
		dirvec: function() {
			var _ = this._, dir = this.target.direction;
			if (!_.dv)
				_.dv = new THREE.Vector3();
			_.dv.x = _.dv.y = _.dv.z = 0;
			this.going() && zero.core.util.dimsum(_.dv,
				_.moving("forward") && dir("front"),
				_.moving("backward") && dir("back"),
				_.moving("left") && dir("left"),
				_.moving("right") && dir("right"));
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
	tap: function(pos) {
		var t = this.target, tt = t && t.thruster, caco, side;
		if (!tt) return;
		caco = zero.core.camera.container();
		side = pos.x < caco.clientWidth / 2 ? "left" : "right";
		if (pos.y < caco.clientHeight / 2) {
			tt.swing(side);
			setTimeout(() => tt.unthrust(side), 500);
		} else {
			tt.kick(side);
			setTimeout(() => tt.unkick(side), 500);
		}
	},
	wallshift: function(shift, prev_spring) {
		var target = this.target;
		prev_spring.boost = 0;
		target.opts.wall = (4 + (target.opts.wall + shift)) % 4;
		target.setBounds(true);
		this.setKeys();
	},
	placer: function(dir, amount, wallshift) {
		var _ = this._, s = this.springs[dir], target = this.target, nxtval,
			topts = target.opts, wall = topts.wall, k = topts.kind, shamount,
			forward = wallshift == 1, shifter = this.wallshift, shifted = this.shifted;
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
			shamount = shifted() ? amount * 2 : amount;
			if (_.structs.includes(k) || _.elecs.includes(k))
				target.adjust("position", dir, shamount / 4, true); // but fix..
			else
				s.boost = shamount;
		};
	},
	face: function(vec) {
		var tar = this.target, bod = tar.body, os = bod.springs.orientation;
		os.hard = false;
		tar.orient(null, zero.core.util.dimsum(vec, bod.position()));
	},
	going: function() {
		const _ = this._;
		return this.gpgoing || CT.key.downs(_.dirs).length
			|| zero.core.gamepads.downs(_.gpdirs).length;
	},
	go: function(soft) {
		var _ = this._, springz = this.springs, vec = _.dirvec(),
			dim, speed = _.speed.base * this.target.energy.k;
		if (soft && !this.going())
			return;
		if (this.target.body.riding)
			speed *= 2;
		for (dim of _.flats)
			springz[dim].boost = speed * vec[dim];
		camera.isPolar && this.face(vec);
	},
	mover: function(fullAmount, dir, smoothy) {
		var _ = this._, target = this.target, going = this.going,
			spr = this.springs[dir], go = this.go, moveCb = _.moveCb,
			amount, isor, isy = dir == "y";
		return function(mult) {
			if (target.zombified) return;
			amount = mult ? fullAmount * mult : fullAmount;
			if (amount) {
				if (isy && !smoothy)
					target.jump(amount);
				else
					target.go();
			} else if (!going())
				target.body.riding || target.undance();
			if (smoothy || !isy) {
				isor = dir == "orientation";
				if (isor) {
					spr.hard = target.body.grippy;
					spr.boost = amount;
				} else if (isy)
					spr.boost = amount;
				go(isor);
			} else if (!amount && !spr.hard)
				target.unjump();
			moveCb && moveCb(target.name);
		};
	},
	clear: function() { // TODO: clear CT.gesture
		CT.key.clear(null, true);
		zero.core.gamepads.clear();
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
		chinput.parentNode.parentNode.parentNode.parentNode.classList[chinput._active ? "add" : "remove"]("active");
		CT.key.setActive(chinput._active && ["CTRL"]);
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
	drop: function() {
		var p = this.target, left = p.held("left"), right = p.held("right");
		if (!left && !right)
			return p.say("i'm not holding anything");
		if (!(left && right))
			return p.drop((left || right).name);
		CT.modal.choice({
			prompt: "drop what?",
			data: [left.name, right.name],
			cb: p.drop
		});
	},
	upAxes: function(axes) {
		var _ = this._, gpd = _.gpdir, x = axes[0], y = axes[1];
		_.look("RIGHT", axes[2]);
		_.look("DOWN", axes[3]);
		_.xygo(x, y);
	},
	initGamepads: function() {
		if (this._gamepadsReady) return;
		this._gamepadsReady = true;
		zero.core.gamepads.init({
			axes: this.upAxes
		});
	},
	up: function() {
		this.target.body.climbing ? this.ascend() : this.forward();
	},
	down: function() {
		this.target.body.climbing ? this.descend() : this.backward();
	},
	crawling: function() {
		return this._.crawling || CT.key.capslocked;
	},
	setNav: function() {
		this.on("w", 12, this.stop, this.up);
		this.on("s", 13, this.stop, this.down);
		CT.key.on("a", this.stop, this.leftStrafe);
		CT.key.on("d", this.stop, this.rightStrafe);
		this.on("z", 14, this.still, this.left);
		this.on("c", 15, this.still, this.right);
		this.on("SPACE", 0, this.unjump, this.jump);
		this.on("SHIFT", 10, this.runner(), this.runner(true));
	},
	setLimbs: function() {
		var tt = this.target.thruster, gp = zero.core.gamepads;
		CT.key.on("DASH", () => this.unholster("left"), () => this.holster("left"));
		CT.key.on("EQUALS", () => this.unholster("right"), () => this.holster("right"));
		CT.key.on("OPEN_BRACKET", () => tt.unthrust("left"), () => tt.swing("left"));
		gp.on(4, () => this.gpunarm("left"), () => this.gparm("left"));
		CT.key.on("CLOSE_BRACKET", () => tt.unthrust("right"), () => tt.swing("right"));
		gp.on(5, () => this.gpunarm("right"), () => this.gparm("right"));
		CT.key.on("SEMICOLON", () => tt.unkick("left"), () => tt.kick("left"));
		gp.on(6, () => this.gpunleg("left"), () => this.gpleg("left"));
		CT.key.on("QUOTE", () => tt.unkick("right"), () => tt.kick("right"));
		gp.on(7, () => this.gpunleg("right"), () => this.gpleg("right"));
	},
	setKeys: function() {
		this.clear();
		var placer = this.placer, mover = this.mover, sz = this._.speed,
			speed = sz.base, ospeed = sz.orientation, jspeed = sz.jump,
			wall, gestures, dances, num = 0, cam = zero.core.camera,
			tt = this.target.thruster;
		this.unjump = mover(0, "y");
		this.jump = mover(jspeed, "y");
		this.forward = mover(speed, "front");
		this.backward = mover(speed, "back");
		this.leftStrafe = mover(speed, "left");
		this.rightStrafe = mover(speed, "right");
		this.descend = mover(-speed, "y", true);
		this.ascend = mover(speed, "y", true);
		this.stop = mover(0);
		this.still = mover(0, "orientation");
		this.left = mover(ospeed, "orientation");
		this.right = mover(-ospeed, "orientation");
		this.holster = (side, checker) => tt[(checker || this.shifted)() ? "back" : "hip"](side);
		this.unholster = (side, checker) => tt[(checker || this.shifted)() ? "unback" : "unhip"](side);
		this.gparm = side => tt[this.shifted() ? "back" : "swing"](side);
		this.gpunarm = side => tt[this.shifted() ? "unback" : "unthrust"](side);
		this.gpleg = side => tt[this.shifted() ? "hip" : "kick"](side);
		this.gpunleg = side => tt[this.shifted() ? "unhip" : "unkick"](side);
		if (tt) { // person
			this.initGamepads();
			this.setNav();
			this.setChat();
			this.setLimbs();
			CT.key.on("BACKSPACE", this.drop);
			CT.key.on("v", () => cam.angle("pov"));
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
		zero.core.current.controls = this;
	}
});