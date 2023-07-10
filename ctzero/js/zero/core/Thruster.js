zero.core.Thruster = CT.Class({
	CLASSNAME: "zero.core.Thruster",
	on: {},
	thrusters: {
		spine: {
			kick: {lumbar: {x: -0.2}, ribs: {x: -0.5}, neck: {x: 2}},
			thrust: {lumbar: {x: 0.2}, ribs: {x: 0.5}, neck: {x: -2}},
			unthrust: {lumbar: {x: 0}, ribs: {x: 0}, neck: {x: 0}}
		},
		arms: {
			downthrust: {shoulder: {x: 0}, elbow: {x: 0}, wrist: {x: 0.5}},
			upthrust: {shoulder: {x: -Math.PI}, elbow: {x: 0}, wrist: {x: 0}},
			unthrust: {clavicle: {y: 0}, shoulder: {x: 0, y: 0}, wrist: {x: 0}}
		},
		legs: {

		}
	},
	set: function(move, part, side) {
		part = part || "spine";
		(this[part] || this.torso[part][side]).setSprings(this.thrusters[part][move]);
	},
	swing: function(side) {
		if (!this.body.holding(side, "smasher"))
			return this.thrust(side);
		this[this.torso.arms[side].swinging ? "downthrust" : "upthrust"](side);
	},
	thrust: function(side) {
		this.set("thrust", "arms", side);
		this.torso.arms[side].thrust();
		this.set("thrust");
	},
	downthrust: function(side) {
		var arm = this.torso.arms[side];
		if (arm.thrusting) return;
		arm.downthrust();
		this.set("thrust");
		setTimeout(() => this.unthrust(side), 400);
	},
	upthrust: function(side) {
		this.torso.arms[side].upthrust();
		this.set("kick");
	},
	unthrust: function(side) {
		var arm = this.torso.arms[side],
			sfx = this.on.thrust && this.on.thrust(side);
		arm.unthrust();
		this.set("unthrust");
		this.person.sfx(sfx || "whoosh");
	},
	kick: function(side, unkickafter) {
		this.torso.legs[side].kick();
		this.set("kick");
		unkickafter && setTimeout(() => this.unkick(side), unkickafter);
	},
	unkick: function(side) {
		this.torso.legs[side].unkick();
		this.set("unthrust");
		this.person.sfx(this.on.kick && this.on.kick(side) || "whoosh");
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
		this.person = this.body.person;
	}
});