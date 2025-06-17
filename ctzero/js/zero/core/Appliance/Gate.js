zero.core.Appliance.Gate = CT.Class({
	CLASSNAME: "zero.core.Appliance.Gate",
	sliders: {
		swing: {
			rotation: {
				y: -Math.PI / 2
			},
			position: {
				z: 50,
				x: -50
			}
		},
		slide: {
			position: {
				x: -100
			}
		},
		squish: {
			scale: {
				x: 0.1
			},
			position: {
				x: -45
			}
		}
	},
	do: function(order, cb) {
		if (!this.power) return this.log("do(", order, ") aborted - no power!")
		this.sound(order);
		this.door.backslide(this.sliders[order], this.simpleBound, cb);
	},
	open: function(cb) {
		this.do(this.opts.opener, cb);
	},
	setSliders: function() {
		const oz = this.opts, sz = this.sliders, w = oz.width, sp = w / 2,
			swip = sz.swing.position, slip = sz.slide.position, squip = sz.squish.position;
		slip.x = -w;
		swip.z = sp;
		swip.x = -sp;
		squip.x = w / 20 - sp;
	},
	preassemble: function() {
		const oz = this.opts, roz = zero.core.current.room.opts;
		oz.parts.push(CT.merge(oz.door, {
			name: "door",
			castShadow: roz.shadows,
			receiveShadow: roz.shadows,
			boxGeometry: [oz.width, oz.height, oz.thickness]
		}));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, this.opts, {
			width: 100,
			height: 100,
			thickness: 10,
			opener: "swing"
		});
		this.setSliders();
	}
}, zero.core.Appliance);