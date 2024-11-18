zero.core.Panel = CT.Class({
	CLASSNAME: "zero.core.Panel",
	kinds: ["button", "switch", "lever"],
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, pad = oz.padding,
			zsurface = -oz.depth / 2, ystep = (oz.height - pad) / 3;
		let i, kind, items, xstep, x, y = -ystep;
		pz.push({
			name: "base",
			boxGeometry: [oz.width, oz.height, oz.depth]
		});
		for (kind of this.kinds) {
			items = oz[kind];
			xstep = (oz.width - pad) / items.length;
			x = -xstep * items.length / 2;
			for (i = 0; i < items.length; i++) {
				pz.push(CT.merge(items[i], {
					subclass: PC[kind],
					name: kind + i,
					kind: kind,
					position: [x, y, zsurface]
				}));
				x += xstep;
			}
			y += ystep;
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			depth: 5,
			width: 20,
			height: 20,
			padding: 5,
			button: [],
			switch: [],
			lever: []
		});
	}
}, zero.core.Thing);

const PAN = zero.core.Panel, PC = PAN.controllers = {}, P8 = Math.PI / 8;

PAN.Button = PC.button = CT.Class({
	CLASSNAME: "zero.core.Panel.Button",
	toggle: function() {
		this.adjust("position", "z", -4);
		// trigger something...
		setTimeout(() => this.adjust("position", "z", 0), 1000);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			cylinderGeometry: true
		});
	}
}, zero.core.Thing);

PAN.Flipper = CT.Class({
	CLASSNAME: "zero.core.Panel.Flipper",
	toggle: function() {
		this._on = !this._on;
		this.adjust("rotation", "x", this._on ? -P8 : P8);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			rotation: [P8, 0, 0]
		});
	}
}, zero.core.Thing);

PAN.Switch = PC.switch = CT.Class({
	CLASSNAME: "zero.core.Panel.Switch",
	preassemble: function() {
		this.opts.parts.push({
			boxGeometry: [4, 4, 12]
		});
	}
}, PAN.Flipper);

PAN.Lever = PC.lever = CT.Class({
	CLASSNAME: "zero.core.Panel.Lever",
	preassemble: function() {
		this.opts.parts = this.opts.parts.concat([{
			boxGeometry: [6, 6, 32],
			position: [-6, 0, 0]
		}, {
			boxGeometry: [6, 6, 32],
			position: [6, 0, 0]
		}, {
			boxGeometry: [18, 8, 6],
			position: [0, 0, -16]
		}]);
	}
}, PAN.Flipper);