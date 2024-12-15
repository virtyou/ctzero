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

zero.core.Appliance.varieties = ["panel", "bulb", "gate", "elevator", "computer"];
zero.core.Appliance.templates = {}; // filled in by one

zero.core.Appliance.tmpopts = function(app) {
	const tz = zero.core.Appliance.templates[app.vlower];
	return tz && tz[app.opts.variety];
};

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

zero.core.Appliance.Elevator = CT.Class({
	CLASSNAME: "zero.core.Appliance.Elevator",
	_unmove: function() {
		this._moving = false;
	},
	open: function(tar) {
		const gz = this.gates;
		gz[tar].open(() => gz.main.open(this._unmove));
	},
	do: function(order) {
		if (!this.power) return this.log("do(", order, ") aborted - no power!")
		this._moving = true;
		this.sound("elevator");
		this.slide("position", "y", this.getY(order), 3000, () => this.open(order));
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
	getTar: function(tname) {
		const r = zero.core.current.room;
		return (tname == "bottom") ? r : r[tname];
	},
	getY: function(tname) {
		return this.getTar(tname).getTop() + this.getRadii().y;
	},
	shifting: function() {
		return this._moving;
	},
	gateOpts: function(goz) {
		const oz = this.opts;
		return CT.merge(goz, {
			kind: "gate",
			subclass: zero.core.Appliance.Gate,
			thickness: oz.thickness,
			circuit: oz.circuit,
			height: oz.height,
			width: oz.width
		});
	},
	setGates: function() {
		const r = zero.core.current.room, oz = this.opts,
			op = oz.position, px = op[0],
			pz = op[2] + (oz.depth / 2) + oz.thickness * 2;
		this.gates = { main: this.maingate };
		for (let tar of oz.targets) {
			this.gates[tar] = r.attach(this.gateOpts({
				name: tar + "gate",
				opener: "slide",
				position: [px, this.getY(tar), pz],
				door: oz.floordoor
			}));
		}
	},
	setCage: function() {
		const r = zero.core.current.room, oz = this.opts, cadd = function(coz) {
			r.attach(CT.merge({
				kind: "wall"
			}, coz, oz.door));
		}, op = oz.position, px = op[0], pz = op[2],
			h = r.bounds.max.y - r.bounds.min.y,
			xo = (oz.width / 2) + oz.thickness * 2,
			zo = (oz.depth / 2) + oz.thickness * 2;
		cadd({
			name: "backcage",
			position: [px, 0, pz - zo],
			boxGeometry: [oz.width, h, oz.thickness]
		});
		cadd({
			name: "leftcage",
			position: [px - xo, 0, pz],
			boxGeometry: [oz.thickness, h, oz.depth]
		});
		cadd({
			name: "rightcage",
			position: [px + xo, 0, pz],
			boxGeometry: [oz.thickness, h, oz.depth]
		});
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
		oz.controls && oz.parts.push({
			thing: "Panel",
			name: "controls",
			button: this.getButtons(),
			position: [0, 0, oz.thickness - d2]
		});
		oz.parts.push(this.gateOpts({
			name: "maingate",
			opener: "squish",
			position: [0, 0, d2],
			door: oz.door
		}));
		this.onReady(this.setGates);
		oz.cage && this.onReady(this.setCage);
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
			cage: true,
			light: {},
			targets: []
		}, this.opts);
	}
}, zero.core.Appliance);

zero.core.Appliance.Bulb = CT.Class({
	CLASSNAME: "zero.core.Appliance.Bulb",
	vmult: 0.02,
	setPower: function(p) {
		const t = this.opts.timeout;
		this.power = p;
		this.setIntensity();
		p && t && setTimeout(() => this.setPower(0), t * 1000);
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
			this.sound("zap");
			this.light.setIntensity(0);
			setTimeout(this.setIntensity, CT.data.random(oz.flickRate * 50));
		}
		oz.flickRate && setTimeout(this.flicker, oz.flickRate * 1000);
	},
	onremove: function() {
		this.unplug();
		this.opts.flickRate = 0;
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
		this.opts = opts = CT.merge(opts, this.opts, {
			intensity: 1,
			flickRate: 4,
			invariance: 10,
			color: 0xffffaf,
			ownCircuit: true,
			timeout: 0 // for motion detection type setups
		});
		opts.flickRate && setTimeout(this.flicker, opts.flickRate * 1000);
	}
}, zero.core.Appliance);

zero.core.Appliance.Computer = CT.Class({
	CLASSNAME: "zero.core.Appliance.Computer",
	messages: [],
	do: function(order) { // {program,data}
		if (!this.power) return this.log("do(", order, ") aborted - no power!")
		this.setProgram(order.program, order.data);
	},
	setProgram: function(program, data) {
		this.opts.program = program;
		this.opts.data = data;
		this[program](data);
	},
	uncur: function() {
		this.screen.curprog && this.screen.detach("curprog");
	},
	setcur: function(copts, nogeo) {
		const bopts = {
			name: "curprog",
			position: [0, 0, 1]
		};
		if (!nogeo)
			bopts.planeGeometry = this.opts.screenDims;
		this.uncur();
		this.screen.attach(CT.merge(copts, bopts), null, true);
	},
	video: function(data) { // supports "fzn:" and "fzn:up:" vlinx
		this.setcur({ video: data });
	},
	vstrip: function(data) {
		this.setcur({ vstrip: data });
	},
	screenSaver: function(vsname) { // TODO : avoid direct one references here and elsewhere
		this.vstrip("templates.one.vstrip." + vsname);
	},
	text: function(data) {
		this.setcur({
			center: false,
			thing: "Text",
			text: data.split(" ").join("\n"),
			material: {
				color: this.opts.textColor
			}
		}, true);
	},
	message: function(data) {
		this.text(data);
		this.messages.push(data);
	},
	browse: function() {
		const mz = this.messages, ml = mz.length,
			msg = "you have " + ml + " messages";
		this.text(msg);
		ml && CT.modal.choice({
			prompt: msg,
			data: mz,
			cb: this.text
		});
	},
	use: function() {
		zero.core.Appliance.Computer.selectors.program(this.do, this.browse);
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts.push({
			name: "screen",
			planeGeometry: oz.screenDims,
			position: oz.screenPos,
			material: {
				color: oz.screenColor
			}
		});
		oz.keyboard && this.buildKeyboard();
	},
	_keyrow: function(z) {
		const pz = [];
		for (let x = -9; x <= 9; x += 3) {
			pz.push({
				position: [x, 1, z],
				boxGeometry: [2, 1, 2]
			});
		}
		return { parts: pz };
	},
	buildKeyboard: function() {
		this.opts.parts.push({
			name: "keyboard",
			boxGeometry: [22, 2, 10],
			position: [0, 0, 20],
			parts: [-3, 0, 3].map(this._keyrow)
		});
	},
	start: function() {
		const oz = this.opts;
		if (oz.screenSaver) {
			oz.program = "screenSaver";
			oz.data = oz.screenSaver;
		}
		oz.program && oz.data && this.do(oz);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			data: null,   // ""
			program: null // video|vstrip|screenSaver|text|message|?
		}, this.opts, {
			keyboard: true,
			screenPos: [0, 0, 0],
			screenDims: [14, 18],
			screenColor: 0x000000,
			textColor: 0x00ff00
		});
		this.onReady(this.start);
	}
}, zero.core.Appliance);

zero.core.Appliance.Computer.selectors = {
	prompt: function(prop, data, cb) {
		CT.modal.choice({
			prompt: "what's the " + prop + "?",
			data: data,
			cb: cb
		});
	},
	program: function(cb, browser) {
		const csz = zero.core.Appliance.Computer.selectors,
			ops = ["video", "screenSaver", "message"];
		browser && ops.push("browse");
		csz.prompt("program", ops, function(program) {
			let cbwrap = data => cb({ program: program, data: data });
			if (program == "message") {
				CT.modal.prompt({
					prompt: "what's the message?",
					cb: cbwrap
				});
			} else if (program == "screenSaver") // TODO : avoid direct one reference!
				csz.prompt("screenSaver", Object.keys(templates.one.vstrip), cbwrap);
			else if (program == "browse")
				browser();
			else // video
				csz.video(cbwrap);
		});
	},
	video: function(cb) {
		let fpref = "fzn:";
		CT.modal.choice({
			prompt: "what kind of video program?",
			data: ["channel", "stream (down)", "stream (up)"],
			cb: function(sel) {
				if (sel == "channel") { // tl channel
					return CT.modal.choice({
						prompt: "what channel?", // TODO : avoid direct ctvu reference
						data: core.config.ctvu.loaders.tlchans,
						cb: chan => cb("tlchan:" + chan)
					});
				} // fzn stream
				if (sel.includes("up"))
					fpref += "up:";
				CT.modal.prompt({
					prompt: "ok, what's the name of the stream?",
					cb: name => cb(fpref + name)
				});
			}
		});
	}
};

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