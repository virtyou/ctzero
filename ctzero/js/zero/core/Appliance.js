zero.core.Appliance = CT.Class({
	CLASSNAME: "zero.core.Appliance",
	setPower: function(p) { // override?
		this.power = p;
	},
	plug: function(circuit) {
		this.circuit = zero.core.Appliance.circuit(circuit);
		this.circuit.plug(this);
	},
	unplug: function() {
		this.circuit.unplug(this);
		delete this.circuit;
	},
	do: function(order) {
		this.log("do:", order);
	},
	sound: function(name) {
		this.sfx(zero.core.Appliance.audio[name]);
	},
	onremove: function() {
		this.unplug();
	},
	initCircuit: function() {
		const oz = this.opts, appy = zero.core.Appliance;
		if (oz.ownCircuit) {
			appy.circuit(oz.circuit).plug(appy.circuit(this.name));
			return this.plug(this.name);
		}
		this.plug(oz.circuit);
	},
	rebuild: function() {
		this.opts = CT.merge(zero.core.Appliance.tmpopts(this), this.opts);
		this.refresh();
		this.start && setTimeout(this.start, 200);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, zero.core.Appliance.tmpopts(this), {
			circuit: "default"
		}, this.opts);
		this.onReady(this.initCircuit);
	}
}, zero.core.Thing);

zero.core.Appliance.varieties = ["panel", "bulb", "gate", "elevator", "computer", "waterheater"];
zero.core.Appliance.templates = {}; // filled in by one

zero.core.Appliance.tmpopts = function(app) {
	const tz = zero.core.Appliance.templates[app.vlower];
	return tz && tz[app.opts.variety];
};