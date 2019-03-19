CT.require("CT.key", true); // rm this import post-testing (should be in app loader)

zero.core.Controls = CT.Class({
	CLASSNAME: "zero.core.Controls",
	_: { // configurize
		speed: 2
	},
	mover: function(dir, amount) {
		var springz = this.springs, target = this.target, speed = this._.speed;
		return function() {
			if (target.gesture) { // person
				if (amount) {
					if (dir == "y")
						target.gesture("jump");
					else
						target.dance("walk");
				} else
					target.undance();
			}
			springz[dir].boost = amount || ((dir == "y") ? -speed : 0);
		};
	},
	clear: function() {
		CT.key.clear(); // also clear CT.gesture when that's added...
	},
	setKeys: function() {
		this.clear();
		var mover = this.mover, speed = this._.speed;
		CT.key.on("UP", mover("z", 0), mover("z", -speed));
		CT.key.on("DOWN", mover("z", 0), mover("z", speed));
		CT.key.on("LEFT", mover("x", 0), mover("x", -speed));
		CT.key.on("RIGHT", mover("x", 0), mover("x", speed));
		if (this.target.gesture) // person
			CT.key.on("CTRL", mover("y", 0), mover("y", speed));
		else
			CT.key.on("ENTER", this.cb);
	},
	setSprings: function() {
		var t = this.target;
		if (t.body) { // person
			this.springs = {
				x: t.body.springs.weave,
				y: t.body.springs.bob,
				z: t.body.springs.slide
			};
		} else { // object
			t.springs.x || zero.core.util.coords(t.position(), function(dim, val) {
				t.springs[dim] = zero.core.springController.add({
					value: val,
					target: val
				}, dim, t);
			});
			this.springs = t.springs;
		}
	},
	setTarget: function(target) {
		this.target = target;
		this.setSprings();
		this.setKeys();
	},
	setCb: function(cb) {
		this.cb = cb;
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