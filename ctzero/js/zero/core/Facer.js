zero.core.Facer = CT.Class({
	CLASSNAME: "zero.core.Facer",
	tick: function() {
		for (var peep of this.ranked())
			if (this.facing(peep))
				return this.face(peep);
		this.person.unlook();
		this.log("unface");
		this.shake();
	},
	ranked: function() {
		var pz = zero.core.current.people,
			me = this.person.name, p, peeps = [];
		for (p in pz) {
			if (p == me)
				continue;
			if (pz[p].body.talking)
				peeps.unshift(p);
			else
				peeps.push(p);
		}
		return peeps;
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
		this.person.look(this.bod(target));
	},
	facing: function(person) {
		return this.angle(person) < 1;
	},
	angle: function(person) {
		return this.dir().angleTo(this.vec(person));
	},
	orientation: function(person) {
		var dir = this.dir(), vec = this.vec(person);
		return dir.x * vec.z - dir.z * vec.x;
	},
	vec: function(person) {
		return zero.core.util.vector(this.pos(), this.pos(person), true);
	},
	dir: function() {
		return this.person.direction();
	},
	pos: function(person) {
		return this.bod(person).position();
	},
	bod: function(person) {
		if (!person)
			person = this.person;
		else if (typeof person == "string")
			person = zero.core.current.people[person];
		return person.body;
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
			interval: 2000,
			autoface: false
		});
		this.person = opts.person;
		opts.autoface && this.start();
	}
});