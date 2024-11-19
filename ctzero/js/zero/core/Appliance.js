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
	onremove: function() {
		this.unplug();
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			circuit: "default"
		}, this.opts);
		this.onReady(() => this.plug(this.opts.circuit));
	}
}, zero.core.Thing);

zero.core.Appliance.Gate = CT.Class({
	CLASSNAME: "zero.core.Appliance.Gate",
	do: function(order) {
		const dadj = this.door.adjust;
		if (order == "swing") {
			dadj("rotation", "y", Math.PI / 2);
			dadj("position", "x", -50);
			dadj("position", "z", 50);
			setTimeout(function() {
				dadj("rotation", "y", 0);
				dadj("position", "x", 0);
				dadj("position", "z", 0);
			}, 2000);
		} else if (order == "slide") {
			dadj("position", "x", -100);
			setTimeout(() => dadj("position", "x", 0), 2000);
		} else if (order == "squish") {
			dadj("scale", "x", 0.1);
			dadj("position", "x", -45);
			setTimeout(function() {
				dadj("scale", "x", 1);
				dadj("position", "x", 0);
			}, 2000);
		} else
			this.log("can't do:", order);
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts.push({
			name: "door",
			boxGeometry: [oz.width, oz.height, oz.thickness]
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			width: 100,
			height: 100,
			thickness: 10
		}, this.opts);
	}
}, zero.core.Appliance);

zero.core.Appliance.Bulb = CT.Class({
	CLASSNAME: "zero.core.Appliance.Bulb",
	setPower: function(p) {
		this.power = p;
		this.light.setIntensity(p);
		this.heart.material.opacity = p * 0.4;
	},
	setColor: function(c) {
		if (typeof c == "number")
			c = zero.core.util.int2rgb(c);
		this.heart.setColor(c);
		this.light.setColor(c);
	},
	do: function(order) {
		this.setColor(order);
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts = oz.parts.concat([{
			name: "glass",
			sphereGeometry: 2,
			material: {
				opacity: 0.2,
				alphaTest: 0.2,
				shininess: 100,
				transparent: true,
				side: THREE.BackSide
			}
		}, {
			name: "heart",
			sphereGeometry: 1,
			material: {
				opacity: 0.4,
				alphaTest: 0.4,
				color: oz.color,
				transparent: true,
				side: THREE.BackSide
			}
		}, {
			name: "base",
			cylinderGeometry: 1,
			position: [0, -3, 0]
		}, {
			name: "light",
			thing: "Light",
			kind: "lighting",
			variety: "point",
			color: oz.color
		}])
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			color: 0xffffaf
		}, this.opts);
	}
}, zero.core.Appliance);

zero.core.Appliance.Circuit = CT.Class({
	CLASSNAME: "zero.core.Appliance.Circuit",
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

const circs = {};

zero.core.Appliance.circuit = function(name) {
	if (!circs[name])
		circs[name] = new zero.core.Appliance.Circuit({ name: name });
	return circs[name];
};