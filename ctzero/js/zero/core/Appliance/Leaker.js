zero.core.Appliance.Leaker = CT.Class({
	CLASSNAME: "zero.core.Appliance.Leaker",
	onready: function() {
		const p = this.position(), r = zero.core.current.room;
		this.puddle = r.addObject(CT.merge(this.opts.puddle, {
			thing: "Puddle",
			secondary: true,
			position: [p.x, this.getBounds().min.y, p.z]
		}));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			puddle: {
				radius: 100
			}
		}, this.opts);
	}
}, zero.core.Appliance);