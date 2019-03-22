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
	mover: function(dir, amount, wallshift) {
		var springz = this.springs, target = this.target,
			speed = this._.speed, wall = target.opts.wall,
			forward = wallshift == 1, s = springz[dir],
			shifter = this.wallshift, nxtval;
		return function() {
			if (wallshift) { // poster only
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
			else if (target.gesture) { // person
				if (amount) {
					if (dir == "y")
						target.gesture("jump");
					else
						target.dance("walk");
				} else
					target.undance();
			}
			if (target.gesture && !amount && (dir == "y"))
				s.boost = -speed;
			else
				s.boost = amount;
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
		var mover = this.mover, speed = this._.speed, ospeed = speed / 10,
			wall, gestures, dances, num = 0;
		if (this.target.gesture) { // person
			CT.key.on("UP", mover("z", 0), mover("z", -speed));
			CT.key.on("DOWN", mover("z", 0), mover("z", speed));
			CT.key.on("LEFT", mover("orientation", 0), mover("orientation", ospeed));
			CT.key.on("RIGHT", mover("orientation", 0), mover("orientation", -ospeed));
			CT.key.on("CTRL", mover("y", 0), mover("y", speed));
			gestures = Object.keys(this.target.opts.gestures);
			dances = Object.keys(this.target.opts.dances);
			this.setNum(0, null, null, true);
			while (num < gestures.length || num < dances.length) {
				this.setNum(num + 1, gestures[num], dances[num]);
				num += 1;
			}
		} else {
			if (["poster", "portal"].indexOf(this.target.opts.kind) != -1) {
				if (this.target.opts.kind == "poster") {
					CT.key.on("UP", mover("y", 0), mover("y", speed));
					CT.key.on("DOWN", mover("y", 0), mover("y", -speed));
				}
				wall = this.target.opts.wall;
				if (wall == 0) {
					CT.key.on("LEFT", mover("x", 0), mover("x", -speed, -1));
					CT.key.on("RIGHT", mover("x", 0), mover("x", speed, 1));
				} else if (wall == 1) {
					CT.key.on("LEFT", mover("z", 0), mover("z", -speed, -1));
					CT.key.on("RIGHT", mover("z", 0), mover("z", speed, 1));
				} else if (wall == 2) {
					CT.key.on("LEFT", mover("x", 0), mover("x", speed, -1));
					CT.key.on("RIGHT", mover("x", 0), mover("x", -speed, 1));
				} else if (wall == 3) {
					CT.key.on("LEFT", mover("z", 0), mover("z", speed, -1));
					CT.key.on("RIGHT", mover("z", 0), mover("z", -speed, 1));
				}
			} else {
				CT.key.on("UP", mover("z", 0), mover("z", -speed));
				CT.key.on("DOWN", mover("z", 0), mover("z", speed));
				CT.key.on("LEFT", mover("x", 0), mover("x", -speed));
				CT.key.on("RIGHT", mover("x", 0), mover("x", speed));
			}
			CT.key.on("ENTER", this._.cb);
		}
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
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			target: null,
			mode: "placement" // or pilot
		});
		opts.cb && this.setCb(opts.cb);
		opts.target && this.setTarget(opts.target);
	}
});