zero.core.auto = {
	_: {},
	json: function() {
		return zero.core.current.room.automatons.map(a => a.json());
	},
	unload: function() {
		zero.core.current.room.automatons.forEach(a => a.pause());
	},
	init: function(autos, cb) { // [{person(key),program{base,coefficient,randomize},activities[]}]
		CT.db.multi(autos.map(a=>a.person), function(people) {
			zero.core.current.room.automatons = people.map(function(p, i) {
				return new zero.core.auto.Automaton(CT.merge({
					person: p
				}, autos[i]));
			});
			cb && cb();
		}, "json");
	}
};

zero.core.auto.Automaton = CT.Class({
	CLASSNAME: "zero.core.auto.Automaton",
	_: {
		index: -1,
		defcount: 0,
		onperson: [],
		next: function() {
			var _ = this._, alen = this.activities.length,
				deferred = _.deferred;
			if (deferred) {
				delete _.deferred;
				return deferred;
			}
			if (this.program.randomize)
				_.index = CT.data.random(alen);
			else
				_.index = (_.index + 1) % alen;
			return this.activities[_.index];
		}
	},
	tick: function() {
		var _ = this._, act = _.next();
		if (!this.person.body) {
			_.defcount += 1;
			if (_.defcount > 3)
				return this.log("tick() cancelled (deferred 3 times)");
			_.deferred = act;
			this.log("tick() postponed (no body)");
			return this.play();
		}
		if (act.action == "dance") {
			this.person.dance(act.value);
			this.play();
		} else // say/respond/move/wander
			this.person[act.action](act.value, this.play);
	},
	play: function() {
		this.pause(); // guards against multiplay
		var pr = this.program;
		this._.timeout = setTimeout(this.tick,
			1000 * pr.base + CT.data.random(pr.coefficient, true));
	},
	pause: function() {
		clearTimeout(this._.timeout);
	},
	onperson: function(cb) {
		if (this.person)
			return cb(this.person);
		this._.onperson.push(cb);
	},
	joined: function(person) {
		this.person = person;
		person.automaton = this;
		var pbs = person.body.springs;
		pbs.slide.k = pbs.weave.k = 4;
		pbs.slide.damp = pbs.weave.damp = 20;
		this.opts.wander && person.wander();
		this.activities.length && this.play();
		this.opts.onjoin && this.opts.onjoin(person);
		for (var cb of this._.onperson)
			cb(this.person);
	},
	reprogram: function(p) {
		this.program = CT.merge(p, this.program, this.opts.program);
	},
	reactivitate: function(a) {
		this.activities = a;
	},
	json: function() {
		return {
			person: this.person.opts.key,
			activities: this.activities,
			program: this.program
		};
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, { // required: person{}
			wander: false,
			activities: [],
			program: {
				base: 5,
				coefficient: 10,
				randomize: true
			}
		});
		this.reprogram();
		opts.person.grippy = false;
		var az0 = opts.activities[0], pb = opts.person.body, wapo, amo;
		if (!pb.position && az0) {
			if (az0.action == "move") {
				amo = az0.value;
				pb.position = [amo.weave, amo.bob, amo.slide];
			} else if (az0.action == "wander" && az0.value != "room") {
				wapo = zero.core.current.room[az0.value].position();
				pb.position = [wapo.x, wapo.y + 100, wapo.z]; // meh?
			}
		}
		this.reactivitate(opts.activities);
		zero.core.util.join(opts.person, this.joined, true);
	}
});