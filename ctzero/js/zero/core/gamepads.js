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
	init: function(opts) {
		const zcg = zero.core.gamepads, _ = zcg._;
		zcg.log = CT.log.getLogger("gamepads");
		_.opts = opts;
		zcg.listen();
	}
};

zero.core.gamepads.GamePad = CT.Class({
	CLASSNAME: "zero.core.gamepads.GamePad",
	_: {
		buttons: [],
		axes: [0, 0, 0, 0],
		bprops: ["pressed", "touched", "value"],
		default: { pressed: false, touched: false, value: 0 },
		upbutt: function(i, butt) {
			const _ = this._, opts = this.opts, cur = _.buttons[i] || _.default;
			for (let prop of _.bprops)
				if (butt[prop] != cur[prop]) {
					if (prop == "value")
						opts[prop](i, butt[prop]);
					else if (butt[prop])
						opts[prop](i);
					else
						opts["un" + prop](i);
				}
		},
		upaxes: function(axes) {
			const curax = this._.axes;
			for (let i = 0; i < axes.length; i++)
				if (axes[i] != curax[i])
					return this.opts.axes(axes);
		}
	},
	update: function(gamepad) {
		const _ = this._;
		this.opts.axes && _.upaxes(gamepad.axes);
		for (let i = 0; i < gamepad.buttons.length; i++)
			_.upbutt(i, gamepad.buttons[i]);
		_.buttons = gamepad.buttons;
		_.axes = gamepad.axes;
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