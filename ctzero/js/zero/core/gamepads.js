zero.core.gamepads = {
	_: {
		pads: [],
		interval: 200,
		connected: function(event) {
			const zcg = zero.core.gamepads, _ = zcg._;
			zcg.log("pad connected");
			_.pads.length || _.start();
			_.pads.push(event.gamepad.index);
		},
		disconnected: function(event) {
			const zcg = zero.core.gamepads, _ = zcg._;
			zcg.log("pad disconnected");
			CT.data.remove(_.pads, event.gamepad.index);
			_.pads.length || _.stop();
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
	update: function(gamepad) {
		const zcg = zero.core.gamepads, _ = zcg._;
		let i, butt;
		_.opts.axes && _.opts.axes(gamepad.axes);
		for (i = 0; i < gamepad.buttons.length; i++) {
			butt = gamepad.buttons[i];
			if (butt.pressed)
				_.opts.pressed(i);
			else if (butt.touched) // don't fire both...
				_.opts.touched(i);
			if (butt.value)
				_.opts.value(i, butt.value);
		}
	},
	tick: function() {
		const zcg = zero.core.gamepads;
		for (let gp of navigator.getGamepads())
			gp && zcg.update(gp);
	},
	listen: function() {
		const zcg = zero.core.gamepads, _ = zcg._;
		if (_.listening) return CT.log("already listening");
		_.listening = true;
		zcg.log("listening");
		window.addEventListener("gamepadconnected", _.connected);
		window.addEventListener("gamepaddisconnected", _.disconnected);
	},
	init: function(opts) {
		const zcg = zero.core.gamepads, _ = zcg._;
		zcg.log = CT.log.getLogger("gamepads");
		_.opts = CT.merge(opts, {
			value: zcg.log,
			pressed: zcg.log,
			touched: zcg.log
		});
		zcg.listen();
	}
};