zero.core.Vibe = CT.Class({
	CLASSNAME: "zero.core.Vibe",
	update: function(vibe) {
		this.person.mood.update(this.opts.vibes[vibe]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			vibes: {}
		});
		this.person = opts.person;
	}
});