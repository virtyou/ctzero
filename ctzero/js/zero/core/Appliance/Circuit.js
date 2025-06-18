zero.core.Appliance.Circuit = CT.Class({
	CLASSNAME: "zero.core.Appliance.Circuit",
	turnOn: function() {
		this.flip(true, this.circuit ? this.circuit.power : this.opts.power);
	},
	flip: function(isOn, power) {
		this.isOn = isOn;
		this.setPower(power);
	},
	setPower: function(p) {
		this.power = p;
		if (!this.isOn)
			p = 0;
		for (let aname in this.appliances)
			this.appliances[aname].setPower(p);
	},
	plug: function(appliance) {
		appliance.setPower(this.power);
		this.appliances[appliance.name] = appliance;
	},
	unplug: function(appliance) {
		appliance.setPower(0);
		delete this.appliances[appliance.name];
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			power: 1,
			isOn: true
		});
		this.power = opts.power;
		this.isOn = opts.isOn;
		this.name = opts.name;
		this.appliances = {};
	}
});

const circs = zero.core.Appliance.circuitry = {};

zero.core.Appliance.circuit = function(name) {
	if (!circs[name])
		circs[name] = new zero.core.Appliance.Circuit({ name: name });
	return circs[name];
};

zero.core.Appliance.initCircuits = function(circs) {
	const appy = zero.core.Appliance;
	let c, pcirc, sub, subs;
	for (c in circs) {
		subs = circs[c];
		pcirc = appy.circuit(c);
		for (sub in subs) {
			pcirc.plug(appy.circuit(sub));
			appy.initCircuits(subs[sub]);
		}
	}
};