zero.core.Thruster = CT.Class({
	CLASSNAME: "zero.core.Thruster",
	on: {},
	flags: { left: {}, right: {} },
	thrusters: {
		spine: {
			kick: {lumbar: {x: -0.2}, ribs: {x: -0.5}, neck: {x: 2}},
			thrust: {lumbar: {x: 0.2}, ribs: {x: 0.5}, neck: {x: -2}},
			unthrust: {lumbar: {x: 0}, ribs: {x: 0}, neck: {x: 0}}
		},
		arms: {
			downthrust: {shoulder: {x: 0}, elbow: {x: 0}, wrist: {x: 0.5}},
			upthrust: {shoulder: {x: -Math.PI}, elbow: {x: 0}, wrist: {x: 0}},
			unthrust: {clavicle: {y: 0}, shoulder: {x: 0, y: 0}, wrist: {x: 0}},
			thrust: {
				left: {
					clavicle: {y: -0.5},
					shoulder: {x: -2, y: -0.5}
				},
				right: {
					clavicle: {y: 0.5},
					shoulder: {x: -2, y: 0.5}
				},
				both: {
					wrist: {x: 1},
					elbow: {x: 0}
				}
			}
		},
		legs: {
			kick: {hip: {x: -2}},
			unkick: {hip: {x: 0}}
		}
	},
	set: function(move, partname, side) {
		partname = partname || "spine";
		var thrust = this.thrusters[partname][move], flags;
		part = this[partname] || this.torso[partname][side];
		if (partname == "arms") {
			flags = this.flags[side];
			if (move == "unthrust") {
				part.unpause();
				flags.thrusting = flags.swinging = false;
			}
			else {
				part.pause();
				flags[(move == "upthrust") ? "swinging" : "thrusting"] = true;
			}
		}
		part.setSprings(thrust.both ? CT.merge(thrust.both, thrust[side]) : thrust);
	},
	swing: function(side) {
		if (!this.body.holding(side, "smasher"))
			return this.thrust(side);
		this[this.flags[side].swinging ? "downthrust" : "upthrust"](side);
	},
	thrust: function(side) {
		this.set("thrust", "arms", side);
		this.set("thrust");
	},
	downthrust: function(side) {
		if (this.flags[side].thrusting) return;
		this.set("downthrust", "arms", side);
		this.set("thrust");
		setTimeout(() => this.unthrust(side), 400);
	},
	upthrust: function(side) {
		this.set("upthrust", "arms", side);
		this.set("kick");
	},
	unthrust: function(side) {
		this.set("unthrust", "arms", side);
		this.set("unthrust");
		this.sfx(this.on.thrust && this.on.thrust(side) || "whoosh");
	},
	kick: function(side, unkickafter) {
		this.set("kick", "legs", side);
		this.set("kick");
		unkickafter && setTimeout(() => this.unkick(side), unkickafter);
	},
	unkick: function(side) {
		this.set("unkick", "legs", side);
		this.set("unthrust");
		this.sfx(this.on.kick && this.on.kick(side) || "whoosh");
	},
	onthrust: function(cb) {
		this.on.thrust = cb; // just one...
	},
	onkick: function(cb) {
		this.on.kick = cb; // just one...
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			// body required; anything else?
		});
		this.body = opts.body;
		this.torso = this.body.torso;
		this.spine = this.body.spine;
		this.sfx = this.body.person.sfx;
	}
});