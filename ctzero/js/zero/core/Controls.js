zero.core.Controls = CT.Class({
	CLASSNAME: "zero.core.Controls",
	_: { // configurize
		speed: 2
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
			speed = this._.speed, direct = this.direct,
			forward = wallshift == 1, nxtval;
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
	mover: function(amount, dir) {
		var target = this.target, spr = this.springs[dir],
			speed = this._.speed, direct = this.direct, moveCb = this._.moveCb;
		return function() {
			if (amount) {
				if (dir == "y")
					target.gesture("jump");
				else
					target.dance("walk");
			} else if (!CT.key.downs(["UP", "DOWN", "LEFT", "RIGHT"]).length)
				target.undance();
			if (dir == "y") {
				if (amount)
					spr.velocity = 500;
				else
					spr.boost = -speed;
			} else if (dir == "orientation") {
				spr.boost = amount;
				if (CT.key.down("UP"))
					direct(speed);
				else if (CT.key.down("DOWN"))
					direct(-speed);
			} else
				direct(amount);
			moveCb && moveCb();
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
	setKeys: function() {
		this.clear();
		var placer = this.placer, mover = this.mover,
			speed = this._.speed, ospeed = speed / 10,
			wall, gestures, dances, num = 0;
		if (this.target.gesture) { // person
			CT.key.on("UP", mover(0), mover(speed));
			CT.key.on("DOWN", mover(0), mover(-speed));
			CT.key.on("LEFT", mover(0, "orientation"), mover(ospeed, "orientation"));
			CT.key.on("RIGHT", mover(0, "orientation"), mover(-ospeed, "orientation"));
			CT.key.on("ALT", mover(0, "y"), mover(speed, "y"));
			gestures = Object.keys(this.target.opts.gestures);
			dances = Object.keys(this.target.opts.dances);
			this.setNum(0, null, null, true);
			while (num < gestures.length || num < dances.length) {
				this.setNum(num + 1, gestures[num], dances[num]);
				num += 1;
			}
		} else {
			if (["poster", "portal", "screen"].indexOf(this.target.opts.kind) != -1) {
				if (["poster", "screen"].indexOf(this.target.opts.kind) != -1) {
					CT.key.on("UP", placer("y", 0), placer("y", speed));
					CT.key.on("DOWN", placer("y", 0), placer("y", -speed));
				}
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
	setTarget: function(target) {
		this.target = target;
		this.setSprings();
		this.setKeys();
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
		opts.target && this.setTarget(opts.target);
	}
});