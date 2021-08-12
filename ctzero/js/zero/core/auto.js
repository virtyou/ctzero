zero.core.auto = {
	_: {},
	init: function(autos) { // [{person(key),interval{base,coefficient,randomize},activities[]}]
		var _ = zero.core.auto._; 
		CT.db.multi(autos.map(a=>a.person), function(people) {
			_.autos = people.map(function(p, i) {
				return new zero.core.auto.Automaton({
					person: p,
					program: autos[i]
				});
			});
		}, "json");
	}
};

zero.core.auto.Automaton = CT.Class({
	CLASSNAME: "zero.core.auto.Automaton",
	_: {
		index: -1,
		next: function() {
			var pr = this.program, pi = pr.interval,
				_ = this._, alen = pr.activities.length;
			if (pi.randomize)
				_.index = CT.data.random(alen);
			else
				_.index = (_.index + 1) % alen;
			return pr.activities[_.index];
		}
	},
	tick: function() {
		var _ = this._, act = _.next();
		if (act.action == "dance") {
			this.person.dance(act.value);
			this.play();
		} else // say/respond/move/wander
			this.person[act.action](act.value, this.play);
	},
	play: function() {
		var pi = this.program.interval;
		this._.timeout = setTimeout(this.tick,
			pi.base + CT.data.random(pi.coefficient, true));
	},
	pause: function() {
		clearTimeout(this._.timeout);
	},
	joined: function(person) {
		this.person = person;
		this.program.activities.length && this.play();
	},
	reprogram: function(p) {
		this.program = CT.merge(p, this.program, this.opts.program);
	},
	init: function(opts) {
		this.opts = opts = CT.merge({ // required: person{}
			program: {
				interval: {
					base: 3,
					coefficient: 7,
					randomize: true
				},
				activities: []
			}
		});
		this.reprogram();
		zero.core.util.join(opts.person, this.joined, true);
	}
});