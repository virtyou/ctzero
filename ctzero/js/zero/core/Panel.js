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
}, zero.core.Thing);

const PAN = zero.core.Panel, PC = {}, PW = {
	button: 4, switch: 4, lever: 8
}, P = Math.PI, P2 = P / 2, P4 = P / 4;

window.testPan = function() {
	return zero.core.current.room.attach({
		thing: "Panel",
		button: [null, null, null, null],
		switch: [null, null, null, null],
		lever: [null, null]
	});
};

PAN.Button = PC.button = CT.Class({
	CLASSNAME: "zero.core.Panel.Button",
	toggle: function() {
		this.adjust("position", "z", -1);
		// trigger something...
		setTimeout(() => this.adjust("position", "z", 0), 1000);
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
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
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