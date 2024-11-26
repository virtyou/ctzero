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
			return this.plug(this.name);
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
	do: function(order, cb) {
		this.sfx(zero.core.Appliance.audio[order]);
		this.door.backslide(this.sliders[order], this.basicBound, cb);
	},
	open: function() {
		this.do(this.opts.opener);
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
			thickness: 10,
			opener: "swing"
		}, this.opts);
		this.setSliders();
	}
}, zero.core.Appliance);

zero.core.Appliance.Elevator = CT.Class({
	CLASSNAME: "zero.core.Appliance.Elevator",
	_unmove: function() {
		this._moving = false;
	},
	do: function(order) {
		const r = zero.core.current.room,
			tar = (order == "bottom") ? r : r[order];
		this._moving = true;
		this.sfx(zero.core.Appliance.audio.elevator);
		this.slide("position", "y", tar.getTop() + this.radii.y,
			3000, () => this.gate.do("squish", this._unmove));
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
		const name = this.name, oz = this.opts;
		oz.targets.length || this.setTargets();
		return oz.targets.map(function(t) {
			return { appliance: name, order: t };
		});
	},
	getTop: function() {
		const oz = this.opts;
		return this.position().y - (oz.height - oz.thickness) / 2;
	},
	shifting: function() {
		return this._moving;
	},
	preassemble: function() {
		const oz = this.opts, zc = zero.core, roz = zc.current.room.opts, wopts = {
			texture: oz.walltex,
			castShadow: roz.shadows,
			receiveShadow: roz.shadows,
		}, appy = zc.Appliance, w2 = oz.width / 2, h2 = oz.height / 2, d2 = oz.depth / 2;
		if (oz.walls) {
			oz.parts = oz.parts.concat([{
				kind: "wall",
				name: "backwall",
				position: [0, 0, -d2],
				boxGeometry: [oz.width, oz.height, oz.thickness]
			}, {
				kind: "wall",
				name: "leftwall",
				position: [-w2, 0, 0],
				boxGeometry: [oz.thickness, oz.height, oz.depth]
			}, {
				kind: "wall",
				name: "rightwall",
				position: [w2, 0, 0],
				boxGeometry: [oz.thickness, oz.height, oz.depth]
			}].map(o => CT.merge(o, wopts)));
		}
		oz.parts.push(CT.merge(wopts, {
			name: "floor",
			position: [0, -h2, 0],
			boxGeometry: [oz.width, oz.thickness, oz.depth]
		}));
		oz.ceiling && oz.parts.push(CT.merge(wopts, {
			name: "ceiling",
			position: [0, h2, 0],
			boxGeometry: [oz.width, oz.thickness, oz.depth]
		}));
		oz.light && oz.parts.push(CT.merge(oz.light, {
			name: "bulb",
			subclass: appy.Bulb,
			circuit: oz.circuit,
			rotation: [Math.PI, 0, 0],
			position: [0, h2 - (oz.thickness + 2), 0]
		}));
		oz.parts.push({
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
			walls: true,
			light: {},
			targets: []
		}, this.opts);
	}
}, zero.core.Appliance);

zero.core.Appliance.Bulb = CT.Class({
	CLASSNAME: "zero.core.Appliance.Bulb",
	setPower: function(p) {
		this.power = p;
		this.setIntensity();
	},
	setIntensity: function() {
		this.heart.material.opacity = this.power * 0.5;
		this.light.setIntensity(this.power * this.opts.intensity);
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
	flicker: function() {
		var oz = this.opts;
		if (!CT.data.random(oz.invariance)) {
			this.light.setIntensity(0);
			setTimeout(this.setIntensity, CT.data.random(oz.flickRate * 50));
		}
		oz.flickRate && setTimeout(this.flicker, oz.flickRate * 1000);
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts = oz.parts.concat([{
			name: "glass",
			sphereGeometry: 2,
			material: {
				opacity: 0.3,
				alphaTest: 0.3,
				shininess: 100,
				transparent: true,
				side: THREE.BackSide
			}
		}, {
			name: "heart",
			sphereGeometry: 1,
			material: {
				opacity: 0.5,
				alphaTest: 0.5,
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
			color: oz.color,
			intensity: oz.intensity
		}]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			intensity: 1,
			flickRate: 4,
			invariance: 10,
			color: 0xffffaf,
			ownCircuit: true
		}, this.opts);
		opts.flickRate && setTimeout(this.flicker, opts.flickRate * 1000);
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