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
	initCircuit: function() {
		const oz = this.opts, appy = zero.core.Appliance;
		if (oz.ownCircuit) {
			appy.circuit(oz.circuit).plug(appy.circuit(this.name));
			oz.circuit = this.name;
		}
		this.plug(oz.circuit);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			circuit: "default"
		}, this.opts);
		this.onReady(this.initCircuit);
	}
}, zero.core.Thing);

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
	do: function(order) {
		this.sfx(zero.core.Appliance.audio[order]);
		this.door.backslide(this.sliders[order]);
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
		const oz = this.opts;
		oz.parts.push(CT.merge(oz.door, {
			name: "door",
			boxGeometry: [oz.width, oz.height, oz.thickness]
		}));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			width: 100,
			height: 100,
			thickness: 10
		}, this.opts);
		this.setSliders();
	}
}, zero.core.Appliance);

zero.core.Appliance.Elevator = CT.Class({
	CLASSNAME: "zero.core.Appliance.Elevator",
	do: function(order) {
		const r = zero.core.current.room,
			tar = (order == "bottom") ? r : r[order];
		this.sfx(zero.core.Appliance.audio.elevator);
		this.slide("position", "y", tar.getTop() + this.radii.y, 3000);
	},
	setTargets: function() {
		const oz = this.opts, r = zero.core.current.room;
		if (r.floor)
			oz.targets = Object.keys(r.floor);
		else if (r.obstacle)
			oz.targets = Object.keys(r.obstacle);
		else
			oz.targets = r.objects.map(o => o.name);
		oz.targets.unshift("bottom");
	},
	getButtons: function() {
		const name = this.name;
		return this.opts.targets.map(function(t) {
			return { appliance: name, order: t };
		});
	},
	preassemble: function() {
		const oz = this.opts, appy = zero.core.Appliance,
			w2 = oz.width / 2, h2 = oz.height / 2, d2 = oz.depth / 2;
		if (oz.walls) {
			oz.parts = oz.parts.concat([{
				name: "backwall",
				texture: oz.walltex,
				position: [0, 0, -d2],
				boxGeometry: [oz.width, oz.height, oz.thickness]
			}, {
				name: "leftwall",
				texture: oz.walltex,
				position: [-w2, 0, 0],
				boxGeometry: [oz.thickness, oz.height, oz.depth]
			}, {
				name: "rightwall",
				texture: oz.walltex,
				position: [w2, 0, 0],
				boxGeometry: [oz.thickness, oz.height, oz.depth]
			}]);
		}
		oz.floor && oz.parts.push({
			name: "floor",
			texture: oz.floortex,
			position: [0, -h2, 0],
			boxGeometry: [oz.width, oz.thickness, oz.depth]
		});
		oz.ceiling && oz.parts.push({
			name: "ceiling",
			texture: oz.walltex,
			position: [0, h2, 0],
			boxGeometry: [oz.width, oz.thickness, oz.depth]
		});
		oz.light && oz.parts.push({
			name: "bulb",
			subclass: appy.Bulb,
			circuit: oz.circuit,
			rotation: [Math.PI, 0, 0],
			position: [0, h2 - (oz.thickness + 2), 0]
		});
		oz.gate && oz.parts.push({
			name: "gate",
			subclass: appy.Gate,
			position: [0, 0, d2],
			thickness: oz.thickness,
			circuit: oz.circuit,
			height: oz.height,
			width: oz.width,
			door: oz.door
		});
		oz.controls && oz.parts.push({
			thing: "Panel",
			name: "controls",
			button: this.getButtons(),
			position: [0, 0, oz.thickness - d2]
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			depth: 120,
			width: 120,
			height: 160,
			thickness: 4,
			basicBound: true,
			controls: true,
			ceiling: true,
			floor: true,
			walls: true,
			light: true,
			gate: true,
			targets: []
		}, this.opts);
		if (!this.opts.targets.length)
			zero.core.util.onRoomReady(this.setTargets);
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
		}]);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			color: 0xffffaf,
			ownCircuit: true
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