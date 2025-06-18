zero.core.Appliance.Leaker = CT.Class({
	CLASSNAME: "zero.core.Appliance.Leaker",
	drip: function() {
		const droz = this.opts.drip;
		this.sound("drip");
		this.puddle.drip(droz.size);
		this.dripper = setTimeout(this.drip,
			droz.rate + CT.data.random(droz.rate, true));
	},
	onready: function() {
		const p = this.position(), r = zero.core.current.room;
		this.puddle = r.addObject(CT.merge(this.opts.puddle, {
			thing: "Puddle",
			secondary: true,
			position: [p.x, this.getBounds().min.y, p.z]
		}));
		this.puddle.onReady(this.drip);
	},
	onremove: function() {
		this.unplug();
		this.unambient();
		clearTimeout(this.dripper);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			puddle: {
				radius: 100
			},
			drip: {
				rate: 5000,
				size: 0.05
			}
		}, this.opts);
	}
}, zero.core.Appliance);