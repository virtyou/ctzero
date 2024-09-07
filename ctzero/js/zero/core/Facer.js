zero.core.Facer = CT.Class({
	CLASSNAME: "zero.core.Facer",
	tick: function() {
		var target, per = this.person, bod = per.body, cam = zero.core.camera;
		if (!bod.isReady() || (per.isYou() && cam.isBehind) || !cam.visible(bod))
			return;
		for (target of this.ranked())
			if (this.facing(target))
				return this.face(target);
	},
	ranked: function() {
		var pz = zero.core.current.people, p, bod,
			me = this.person.name, targets = [];
		for (p in pz) {
			if (p == me)
				continue;
			bod = pz[p].body;
			if (!bod.isReady())
				continue;
			if (bod.talking)
				targets.unshift(p);
			else
				targets.push(p);
		}
		targets.push("camera");
		return targets;
	},
	shake: function(target) {
		this.person.body.springs.shake.target = target || 0;
	},
	face: function(target) { // improve
		var orientation = this.orientation(target);
		this.opts.verbose && this.log("face()", this.person.name, target);
		this.shake(-orientation * Math.PI / 360);
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
		return this.person.direction("front", true);
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
			verbose: false,
			autoface: false
		});
		this.person = opts.person;
		opts.autoface && this.start();
	}
});