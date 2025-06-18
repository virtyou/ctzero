zero.core.Appliance.Elevator = CT.Class({
	CLASSNAME: "zero.core.Appliance.Elevator",
	_unmove: function() {
		this._moving = false;
	},
	open: function(tar) {
		const gz = this.gates;
		gz[tar || "main"].open(() => gz.main.open(this._unmove));
	},
	do: function(order) {
		if (!this.power) return this.log("do(", order, ") aborted - no power!");
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