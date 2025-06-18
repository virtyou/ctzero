zero.core.Appliance.WaterHeater = CT.Class({
	CLASSNAME: "zero.core.Appliance.WaterHeater",
	setPower: function(p) {
		this.power = p;
		if (!p)
			this._on = false;
		this.setMode();
	},
	do: function(order) {
		if (!this.power) return this.log("do(", order, ") aborted - no power!");
		if (order == "toggle")
			this.toggle();
	},
	toggle: function() {
		this._on = !this._on;
		this.setMode();
	},
	setMode: function() {
		let col = 0x000000, amb = null;
		if (this.power) {
			col = this._on ? 0x00ff00 : 0xff0000;
			amb = this._on ? "whon" : "whoff";
		}
		this.diode.setColor(col);
		this.ambience(amb);
	},
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, roz = zero.core.current.room.opts;
		pz.push(CT.merge(oz.tank, {
			name: "tank",
			geomult: 3,
			cylinderGeometry: 40,
			castShadow: roz.shadows,
			receiveShadow: roz.shadows,
			rotation: [0, Math.PI / 2, 0]
		}));
		pz.push(CT.merge(oz.controls, {
			thing: "Panel",
			name: "controls",
			position: [0, 40, 40],
			button: [{
				appliance: this.name, order: "toggle"
			}]
		}));
		pz.push({
			name: "diode",
			intensity: 0.2,
			color: 0xff0000,
			position: [0, 48, 41],
			circuit: this.opts.circuit,
			subclass: zero.core.Appliance.Bulb
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			ambients: ["whoff", "whon"],
			audroot: "zero.core.Appliance"
		}, this.opts);
	}
}, zero.core.Appliance.Leaker);