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
	update: function(gamepad) {
		const opts = this.opts;
		let i, butt;
		opts.axes && opts.axes(gamepad.axes);
		for (i = 0; i < gamepad.buttons.length; i++) {
			butt = gamepad.buttons[i];
			if (butt.pressed)
				opts.pressed(i);
			else if (butt.touched) // don't fire both...
				opts.touched(i);
			if (butt.value)
				opts.value(i, butt.value);
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			value: this.log,
			pressed: this.log,
			touched: this.log
		});
	}
});