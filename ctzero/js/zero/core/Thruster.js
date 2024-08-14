zero.core.Thruster = CT.Class({
	CLASSNAME: "zero.core.Thruster",
	ons: {},
	flags: { left: {}, right: {} },
	thrusters: {
		spine: {
			kick: {lumbar: {x: -0.2}, ribs: {x: -0.5}, neck: {x: 2}},
			thrust: {lumbar: {x: 0.2}, ribs: {x: 0.5}, neck: {x: -2}},
			unthrust: {lumbar: {x: 0}, ribs: {x: 0}, neck: {x: 0}}
		},
		arms: {
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
			},
			unthrust: {clavicle: {y: 0}, shoulder: {x: 0, y: 0, z: 0}, elbow: {x: 0}, wrist: {x: 0}},
			down: {shoulder: {x: 0}, elbow: {x: 0}, wrist: {x: 0.5}},
			up: {shoulder: {x: -Math.PI}, elbow: {x: 0}, wrist: {x: 0}},
			back: {shoulder: {x: -Math.PI}, elbow: {x: -Math.PI}, wrist: {x: 0}},
			hip: {
				left: {
					shoulder: {x: 1, y: -0.5, z: -0.5}
				},
				right: {
					shoulder: {x: 1, y: 0.5, z: 0.5}
				},
				both: {
					elbow: {x: -Math.PI},
					wrist: {x: 0}
				}
			}
		},
		legs: {
			kick: {hip: {x: -2}},
			unkick: {hip: {x: 0}}
		}
	},
	set: function(move, partname, side, altmove) {
		partname = partname || "spine";
		var thrust = this.thrusters[partname][move], flags, unun;
		part = this[partname] || this.torso[partname][side];
		part.setSprings(thrust.both ? CT.merge(thrust.both, thrust[side]) : thrust);
		if (partname == "spine") return;
		flags = this.flags[side];
		if (move.startsWith("un")) {
			part.unpause();
			if (move == "unthrust")
				flags.thrusting = flags.swinging = false;
			move = altmove || move;
			this.sfx(this.ons[move] && this.ons[move](side) || "whoosh");
		} else {
			part.pause();
			flags[(move == "up") ? "swinging" : "thrusting"] = true;
		}
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
		this.set("down", "arms", side);
		this.set("thrust");
		setTimeout(() => this.unthrust(side), 400);
	},
	upthrust: function(side) {
		this.set("up", "arms", side);
		this.set("kick");
	},
	unthrust: function(side) {
		this.set("unthrust", "arms", side);
		this.set("unthrust");
	},
	back: function(side) {
		this.set("back", "arms", side);
	},
	unback: function(side) {
		this.set("unthrust", "arms", side, "unback");
	},
	hip: function(side) {
		this.set("hip", "arms", side);
	},
	unhip: function(side) {
		this.set("unthrust", "arms", side, "unhip");
	},
	kick: function(side, unkickafter) {
		this.set("kick", "legs", side);
		this.set("kick");
		unkickafter && setTimeout(() => this.unkick(side), unkickafter);
	},
	unkick: function(side) {
		this.set("unkick", "legs", side);
		this.set("unthrust");
	},
	touch: function(side) {
		var held = this.body.person.held(side);
		held && held.touch();
	},
	defaultUnthrust: function() {
		if (this.ons.unthrust)
			return this.log("defaultUnthrust(): unthrust already set");
		this.log("defaultUnthrust(): registering basic touch callback");
		this.on("unthrust", this.touch);
	},
	on: function(move, cb) {
		this.ons[move] = cb; // just one
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