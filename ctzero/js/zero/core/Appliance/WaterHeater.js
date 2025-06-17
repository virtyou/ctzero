zero.core.Appliance.WaterHeater = CT.Class({
	CLASSNAME: "zero.core.Appliance.WaterHeater",
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
			position: [0, 0, 40],
			button: [{
				appliance: this.name, order: "restart"
			}]
		}));
	},
	init: function(opts) {

	}
}, zero.core.Appliance);