zero.core.Facer = CT.Class({
	CLASSNAME: "zero.core.Facer",
	tick: function() {
		if (!this.person.body.isReady())
			return this.log("tick() waiting for body");
		for (var target of this.ranked())
			if (this.facing(target))
				return this.face(target);
		this.face("camera");
	},
	ranked: function() {
		var pz = zero.core.current.people,
			me = this.person.name, p, targets = [];
		for (p in pz) {
			if (p == me)
				continue;
			if (pz[p].body.talking)
				targets.unshift(p);
			else
				targets.push(p);
		}
		return targets;
	},
	shake: function(target) {
		this.person.body.springs.shake.target = target || 0;
	},
	face: function(target) { // improve
		var orientation = this.orientation(target);
		if (Math.abs(orientation) > 50)
			this.shake(orientation > 0 ? -1 : 1);
		else
			this.shake();
		this.log("face()", target);
		this.person.look(this.target(target));
	},
	facing: function(target) {
		return this.angle(target) < 1;
	},
	angle: function(target) {
		return this.dir().angleTo(this.vec(target));
	},
	orientation: function(target) {
		var dir = this.dir(), vec = this.vec(target);
		return dir.x * vec.z - dir.z * vec.x;
	},
	vec: function(target) {
		return zero.core.util.vector(this.pos(), this.pos(target), true);
	},
	dir: function() {
		return this.person.direction();
	},
	pos: function(target) {
		return this.target(target).position();
	},
	target: function(target) {
		var zc = zero.core;
		if (target == "camera")
			return zc.camera;
		if (!target)
			target = this.person;
		else if (typeof target == "string")
			target = zc.current.people[target];
		return target.body;
	},
	stop: function() {
		delete this.person;
		clearInterval(this.ticker);
	},
	start: function() {
		this.ticker = setInterval(this.tick, this.opts.interval);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			interval: 1000,
			autoface: false
		});
		this.person = opts.person;
		opts.autoface && this.start();
	}
});