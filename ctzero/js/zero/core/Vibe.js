zero.core.Vibe = CT.Class({
	CLASSNAME: "zero.core.Vibe",
	update: function(vibe) {
		this.current = vibe;
		this.person.mood.update(this.opts.vibes[vibe]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			current: "default",
			vibes: {}
		});
		this.person = opts.person;
		this.current = opts.current;
	}
});