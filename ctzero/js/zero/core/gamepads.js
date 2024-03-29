zero.core.gamepads = {
	_: {
		pads: {},
		interval: 200,
		connected: function(event) {
			const zcg = zero.core.gamepads, _ = zcg._;
			zcg.log("pad connected");
			Object.keys(_.pads).length || _.start();
			_.pads[event.gamepad.index] = new zcg.GamePad(_.opts);
		},
		disconnected: function(event) {
			const zcg = zero.core.gamepads, _ = zcg._;
			zcg.log("pad disconnected");
			delete _.pads[event.gamepad.index];
			Object.keys(_.pads).length || _.stop();
		},
		start: function() {
			const zcg = zero.core.gamepads, _ = zcg._;
			_.ticker = setInterval(zcg.tick, _.interval);
			zcg.log("ticker started");
		},
		stop: function() {
			const zcg = zero.core.gamepads;
			clearTimeout(zcg._.ticker);
			zcg.log("ticker stopped");
		}
	},
	tick: function() {
		const _ = zero.core.gamepads._;
		for (let gp of navigator.getGamepads())
			gp && _.pads[gp.index].update(gp);
	},
	listen: function() {
		const zcg = zero.core.gamepads, _ = zcg._;
		if (_.listening) return zcg.log("already listening");
		_.listening = true;
		zcg.log("listening");
		window.addEventListener("gamepadconnected", _.connected);
		window.addEventListener("gamepaddisconnected", _.disconnected);
	},
	downs: function(butts, fprop) {
		return butts.filter(zero.core.gamepads[fprop || "pressed"]);
	},
	pressed: function(button) {
		return zero.core.gamepads.butt(button, "pressed");
	},
	touched: function(button) {
		return zero.core.gamepads.butt(button, "touched");
	},
	value: function(button) {
		return zero.core.gamepads.butt(button, "value");
	},
	butt: function(button, prop) {
		const pads = zero.core.gamepads._.pads;
		prop = prop || "pressed";
		for (let index in pads) // TODO: distinguish between controllers...
			return pads[index][prop](button);
	},
	clear: function() {
		const opts = zero.core.gamepads._.opts;
		if (!opts) return;
		for (let butt in opts.cbs)
			delete opts.cbs[butt];
	},
	on: function(button, unpressed, pressed, untouched, touched, value) {
		const cbs = zero.core.gamepads._.opts.cbs;
		if (!cbs[button]) // shared cbs{} (for now...)
			cbs[button] = {};
		if (unpressed)
			cbs[button].unpressed = unpressed;
		if (pressed)
			cbs[button].pressed = pressed;
		if (untouched)
			cbs[button].untouched = untouched;
		if (touched)
			cbs[button].touched = touched;
		if (value)
			cbs[button].value = value;
	},
	init: function(opts) {
		const zcg = zero.core.gamepads, _ = zcg._;
		zcg.log = CT.log.getLogger("gamepads");
		_.opts = CT.merge(opts, {
			cbs: {}
		});
		zcg.listen();
	}
};

zero.core.gamepads.GamePad = CT.Class({
	CLASSNAME: "zero.core.gamepads.GamePad",
	_: {
		cbs: {},
		sigfig: 10,
		buttons: [],
		axes: [0, 0, 0, 0],
		bprops: ["pressed", "touched", "value"],
		default: { pressed: false, touched: false, value: 0 },
		round: function(n) {
			var sigfig = this._.sigfig;
			return parseInt(n * sigfig) / sigfig;
		},
		upbutt: function(i, butt) {
			const _ = this._, opts = this.opts, cbs = opts.cbs,
				cur = _.buttons[i] || _.default;
			for (let prop of _.bprops)
				if (butt[prop] != cur[prop]) {
					if (prop == "value")
						opts[prop](i, butt[prop]);
					else {
						if (!butt[prop])
							prop = "un" + prop;
						opts[prop](i);
					}
					cbs[i] && cbs[i][prop] && cbs[i][prop](butt[prop]);
				}
		},
		upaxes: function(axes) {
			const curax = this._.axes;
			for (let i = 0; i < axes.length; i++)
				if (axes[i] != curax[i])
					return this.opts.axes(axes);
		}
	},
	pressed: function(button) {
		const bz = this._.buttons;
		return bz[button] && bz[button].pressed;
	},
	update: function(gamepad) {
		const _ = this._, axes = gamepad.axes.map(_.round);
		this.opts.axes && _.upaxes(axes);
		for (let i = 0; i < gamepad.buttons.length; i++)
			_.upbutt(i, gamepad.buttons[i]);
		_.buttons = gamepad.buttons;
		_.axes = axes;
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			value: this.log,
			pressed: this.log,
			touched: this.log,
			unpressed: this.log,
			untouched: this.log
		});
	}
});