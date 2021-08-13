zero.core.auto = {
	_: {},
	json: function() {
		return zero.core.current.zone.automatons.map(a => a.json());
	},
	init: function(autos) { // [{person(key),program{base,coefficient,randomize,activities[]}}]
		CT.db.multi(autos.map(a=>a.person), function(people) {
			zero.core.current.room.automatons = people.map(function(p, i) {
				return new zero.core.auto.Automaton({
					person: p,
					program: autos[i].program
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
			var _ = this._, pr = this.program,
				alen = pr.activities.length;
			if (pr.randomize)
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
		var pr = this.program;
		this._.timeout = setTimeout(this.tick,
			pr.base + CT.data.random(pr.coefficient, true));
	},
	pause: function() {
		clearTimeout(this._.timeout);
	},
	joined: function(person) {
		this.person = person;
		this.opts.wander && person.wander();
		this.program.activities.length && this.play();
		this.opts.onjoin && this.opts.onjoin(person);
	},
	reprogram: function(p) {
		this.program = CT.merge(p, this.program, this.opts.program);
	},
	json: function() {
		return {
			person: this.person.opts.key,
			program: this.program
		};
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, { // required: person{}
			wander: true,
			program: {
				base: 3,
				coefficient: 7,
				activities: [],
				randomize: true
			}
		});
		this.reprogram();
		zero.core.util.join(opts.person, this.joined, true);
	}
});