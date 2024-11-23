zero.core.Panel = CT.Class({
	CLASSNAME: "zero.core.Panel",
	kinds: ["button", "switch", "lever"],
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, pad = oz.pad, zsurface = oz.depth / 2;
		let i, kind, items, xstep, x, y, p, kwidth, width, height, rows = 0;
		for (kind of this.kinds)
			if (oz[kind].length)
				rows += 1;
		height = rows * oz.row;
		y = (height - oz.row) / 2;
		for (kind of this.kinds) {
			items = oz[kind];
			if (!items.length) continue;
			xstep = PW[kind];
			kwidth = xstep * items.length;
			if (!width || kwidth > width)
				width = kwidth;
			x = (xstep - kwidth) / 2;
			for (i = 0; i < items.length; i++) {
				p = CT.merge(items[i], {
					subclass: PC[kind],
					name: kind + i,
					kind: kind,
					panel: this,
					position: [x, y, zsurface]
				});
				if (kind == "button")
					p.color = oz.buttonColor;
				else if (kind == "lever")
					p.color = oz.leverHandleColor;
				pz.push(p);
				x += xstep;
			}
			y -= oz.row;
		}
		pz.push({
			name: "base",
			material: {
				color: oz.baseColor
			},
			boxGeometry: [width + pad, height + pad, oz.depth]
		});
	},
	toggle: function() {
		const ops = this.options();
		if (ops.length == 1)
			return this[ops[0]].toggle();
		return CT.modal.choice({
			prompt: "what do you toggle?",
			data: ops,
			cb: op => this[op].toggle()
		});
	},
	options: function() {
		let ops = [], k;
		for (k of this.kinds)
			if (this[k])
				ops = ops.concat(Object.keys(this[k]));
		return ops;
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			button: [],
			switch: [],
			lever: [],
			depth: 4,
			row: 4,
			pad: 4,
			baseColor: 0x808080,
			buttonColor: 0xff0000,
			leverHandleColor: 0xff0000
		}, this.opts);
	}
}, zero.core.Appliance);

var PAN = zero.core.Panel, PC = {}, PW = {
	button: 4, switch: 4, lever: 8
}, P = Math.PI, P2 = P / 2, P4 = P / 4;

window.testPan = function() {
	const zc = zero.core, r = zc.current.room, appy = zc.Appliance;
	appy.circuit("default").plug(appy.circuit("room"));
	r.attach({
		name: "bulb0",
		circuit: "room",
		subclass: appy.Bulb,
		position: [-20, 0, 0]
	});
	r.attach({
		name: "bulb1",
		circuit: "room",
		subclass: appy.Bulb,
		position: [20, 0, 0]
	});
	r.attach({
		name: "gate0",
		circuit: "room",
		subclass: appy.Gate,
		position: [0, 0, -100]
	});
	return r.attach({
		thing: "Panel",
		button: [{
			appliance: "bulb0", order: 0xff0000
		}, {
			appliance: "bulb0", order: 0x00ff00
		}, {
			appliance: "bulb0", order: 0x0000ff
		}, {
			appliance: "gate0", order: "swing"
		}, {
			appliance: "gate0", order: "slide"
		}, {
			appliance: "gate0", order: "squish"
		}],
		switch: [{circuit: "bulb0"}, {circuit: "bulb1"}],
		lever: [{circuit: "room"}]
	});
};

window.testEl = function() {
	var zc = zero.core;
	return zc.current.room.attach({
		subclass: zc.Appliance.Elevator,
		template: "templates.one.appliance.elevator"
	});
}

PAN.Button = PC.button = CT.Class({
	CLASSNAME: "zero.core.Panel.Button",
	toggle: function() {
		const oz = this.opts, zc = zero.core;
		this.sfx(zc.Appliance.audio.button);
		this.adjust("position", "z", -1, true);
		oz.panel.power && zc.current.room[oz.appliance].do(oz.order);
		setTimeout(() => this.adjust("position", "z", 1, true), 1000);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true,
			rotation: [P2, 0, 0],
			material: {
				color: opts.color
			}
		}, this.opts);
	}
}, zero.core.Thing);

PAN.Flipper = CT.Class({
	CLASSNAME: "zero.core.Panel.Flipper",
	toggle: function() {
		const oz = this.opts, appy = zero.core.Appliance;
		this._on = !this._on;
		this.sfx(appy.audio[this.vlower]);
		this.adjust("rotation", "x", this._on ? -P4 : P4);
		appy.circuit(oz.circuit).flip(this._on, oz.panel.power);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			circuit: "default",
			rotation: [P4, 0, 0]
		}, this.opts);
	}
}, zero.core.Thing);

PAN.Switch = PC.switch = CT.Class({
	CLASSNAME: "zero.core.Panel.Switch",
	preassemble: function() {
		this.opts.parts.push({
			boxGeometry: [1, 1, 4]
		});
	}
}, PAN.Flipper);

PAN.Lever = PC.lever = CT.Class({
	CLASSNAME: "zero.core.Panel.Lever",
	preassemble: function() {
		const oz = this.opts;
		oz.parts = oz.parts.concat([{
			boxGeometry: [1, 2, 16],
			position: [-2, 0, 0]
		}, {
			boxGeometry: [1, 2, 16],
			position: [2, 0, 0]
		}, {
			boxGeometry: [6, 2, 1],
			position: [0, 0, 8],
			material: {
				color: oz.color
			}
		}]);
	}
}, PAN.Flipper);