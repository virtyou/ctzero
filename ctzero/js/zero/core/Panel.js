zero.core.Panel = CT.Class({
	CLASSNAME: "zero.core.Panel",
	kinds: ["button", "switch", "lever"],
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, pad = oz.pad, zsurface = oz.depth / 2;
		let i, kind, items, xstep, x, y, kwidth, width, height, rows = 0;
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
				pz.push(CT.merge(items[i], {
					subclass: PC[kind],
					name: kind + i,
					kind: kind,
					panel: this,
					position: [x, y, zsurface]
				}));
				x += xstep;
			}
			y -= oz.row;
		}
		pz.push({
			name: "base",
			boxGeometry: [width + pad, height + pad, oz.depth]
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			button: [],
			switch: [],
			lever: [],
			depth: 4,
			row: 4,
			pad: 4
		}, this.opts);
	}
}, zero.core.Appliance);

var PAN = zero.core.Panel, PC = {}, PW = {
	button: 4, switch: 4, lever: 8
}, P = Math.PI, P2 = P / 2, P4 = P / 4;

window.testPan = function() {
	const zc = zero.core, r = zc.current.room,
		appy = zc.Appliance, rcirc = appy.circuit("room");
	appy.circuit("default").plug(rcirc);
	rcirc.plug(appy.circuit("light0"));
	rcirc.plug(appy.circuit("light1"));
	r.attach({
		name: "bulb0",
		circuit: "light0",
		subclass: appy.Bulb,
		position: [-20, 0, 0]
	});
	r.attach({
		name: "bulb1",
		circuit: "light1",
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
		switch: [{circuit: "light0"}, {circuit: "light1"}],
		lever: [{circuit: "room"}]
	});
};

window.testEl = function() {
	var zc = zero.core;
	return zc.current.room.attach({
		subclass: zc.Appliance.Elevator
	});
}

PAN.Button = PC.button = CT.Class({
	CLASSNAME: "zero.core.Panel.Button",
	toggle: function() {
		const oz = this.opts;
		this.adjust("position", "z", -1, true);
		setTimeout(() => this.adjust("position", "z", 1, true), 1000);
		oz.panel.power && zero.core.current.room[oz.appliance].do(oz.order);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true,
			rotation: [P2, 0, 0]
		}, this.opts);
	}
}, zero.core.Thing);

PAN.Flipper = CT.Class({
	CLASSNAME: "zero.core.Panel.Flipper",
	toggle: function() {
		this._on = !this._on;
		this.adjust("rotation", "x", this._on ? -P4 : P4);
		zero.core.Appliance.circuit(this.opts.circuit).flip(this._on,
			this.opts.panel.power);
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
		this.opts.parts = this.opts.parts.concat([{
			boxGeometry: [1, 2, 16],
			position: [-2, 0, 0]
		}, {
			boxGeometry: [1, 2, 16],
			position: [2, 0, 0]
		}, {
			boxGeometry: [6, 2, 1],
			position: [0, 0, 8]
		}]);
	}
}, PAN.Flipper);