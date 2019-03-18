CT.require("CT.key", true); // rm this import post-testing (should be in app loader)

zero.core.Controls = CT.Class({
	CLASSNAME: "zero.core.Controls",
	mover: function(dir, amount) {
		var springz = this.springs, target = this.target;
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
	setKeys: function() {
		var mover = this.mover, speed = 2;
		CT.key.on("UP", mover("z", 0), mover("z", -speed));
		CT.key.on("DOWN", mover("z", 0), mover("z", speed));
		CT.key.on("LEFT", mover("x", 0), mover("x", -speed));
		CT.key.on("RIGHT", mover("x", 0), mover("x", speed));
		CT.key.on("CTRL", mover("y", 0), mover("y", speed));
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
				});
			});
			this.springs = t.springs;
		}
	},
	setTarget: function(target) {
		this.target = target;
		this.setSprings();
		this.setKeys();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			target: null,
			mode: "placement" // or pilot
		});
		opts.target && this.setTarget(opts.target);
	}
});