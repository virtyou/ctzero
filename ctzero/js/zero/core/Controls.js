zero.core.Controls = CT.Class({
	CLASSNAME: "zero.core.Controls",
	_: { // configurize
		speed: {
			base: 100,
			jump: 500,
			descent: -50,
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
			}
		},
		dirs: ["w", "s", "a", "d"],
		xlrmode: "walk", // walk|look|dance
		look: function(dir, mult) {
			var _ = this._, cz = _.cams, mode,
				per = camera.get("perspective"),
				zcc = zero.core.current, rule, bs;
			if (per == zcc.person) {
				mode = cz.pov;//[camera.current];
//				if (camera.current == "pov") {
				rule = mode[dir];
				bs = zcc.person.body.springs;
				bs[rule[0]].target += rule[1] * (mult || 1);
//				} disabled behind zoom/shift for now ... better right?
			} else {
				mode = per ? cz.interactive : cz.environmental;
				rule = mode[dir];
				zero.core.camera[rule[0]](rule[1]);
			}
		},
		cam: function(dir) {
			CT.key.on(dir, () => this._.look(dir));
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
			dy && _.look("DOWN", dy / 200);
			dx && _.look("LEFT", dx / 400);
		},
		camouse: function() {
			CT.require("CT.gesture", true);
			CT.gesture.listen("drag", CT.dom.id("vnode") || CT.dom.id("ctmain"), this._.cadrag);
		}
	},
	setXLRMode: function(m) {
		this._.xlrmode = m;
	},
	setCams: function() {
		var _ = this._, cfg = core.config.ctzero.camera;
		["UP", "DOWN", "LEFT", "RIGHT"].forEach(_.cam);
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
		var s = this.springs[dir], target = this.target,
			wall = target.opts.wall, shifter = this.wallshift,
			direct = this.direct, forward = wallshift == 1, nxtval;
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
			if (["floor", "obstacle", "wall", "ramp"].includes(target.opts.kind))
				target.adjust("position", dir, amount, true); // but fix..
			else
				s.boost = amount;
		};
	},
	direct: function(speed) {
		var springz = this.springs,
			vec = this.target.direction();
		["x", "z"].forEach(function(dim) {
			springz[dim].boost = speed * vec[dim];
		});
	},
	mover: function(fullAmount, dir) {
		var target = this.target, spr = this.springs[dir], _ = this._, amount,
			speed = _.speed.base, direct = this.direct, moveCb = _.moveCb;
		return function(mult) {
			amount = mult ? fullAmount * mult : fullAmount;
			if (amount) {
				if (dir == "y")
					target.jump();
				else
					target.go();
			} else if (!CT.key.downs(_.dirs).length)
				target.undance();
			if (dir == "y") {
				if (amount) {
					if (spr.floored) {
						spr.boost = amount;
						spr.floored = false;
					} else if (!spr.hard)
						spr.boost = amount;
				} else if (!spr.hard)
					spr.boost = _.speed.descent;
			} else if (dir == "orientation") {
				spr.boost = amount;
				if (CT.key.down("w"))
					direct(speed * target.energy.k);
				else if (CT.key.down("s"))
					direct(-speed * target.energy.k);
			} else
				direct(amount * target.energy.k);
			moveCb && moveCb(target.name);
		};
	},
	clear: function() {
		CT.key.clear(); // also clear CT.gesture when that's added...
	},
	setNum: function(num, gesture, dance, stop) {
		var target = this.target;
		CT.key.on(num.toString(), function() {
			if (CT.key.down("SHIFT"))
				stop ? target.undance() : (dance && target.dance(dance));
			else
				stop ? target.ungesture() : (gesture && target.gesture(gesture));
		});
	},
	runner: function(running) {
		var t = this.target, m = t.mood, en = t.energy,
			oe = m.orig_opts.energy || 1, od = en.opts.damp,
			e = running ? 2 * oe : oe, d = running ? 0.6 * od : od;
		return function() {
			m.update({ energy: e });
			en.damp = d;
		};
	},
	setKeys: function() {
		this.clear();
		var placer = this.placer, mover = this.mover, sz = this._.speed,
			speed = sz.base, ospeed = sz.orientation, jspeed = sz.jump,
			wall, gestures, dances, num = 0, runner = this.runner;
		this.jump = mover(jspeed, "y");
		this.unjump = mover(0, "y");
		this.forward = mover(speed);
		this.backward = mover(-speed);
		this.stop = mover(0);
		this.still = mover(0, "orientation");
		this.left = mover(ospeed, "orientation");
		this.right = mover(-ospeed, "orientation");
		if (this.target.gesture) { // person
			CT.key.on("w", this.stop, this.forward);
			CT.key.on("s", this.stop, this.backward);
			CT.key.on("a", this.still, this.left);
			CT.key.on("d", this.still, this.right);
			CT.key.on("SPACE", this.jump, this.unjump);
			CT.key.on("SHIFT", runner(), runner(true));
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