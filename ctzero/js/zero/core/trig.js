zero.core.trig = {
	_: {
		sin: {},
		amps: {}
	},
	sin: function(angle, amp) { // 628
		var segs = zero.core.trig.segs(628, amp),
			angish = Math.floor(angle * 100),
			val = segs[Math.abs(angish) % 628];
		return angish < 0 ? -val : val;
	},
	sin60: function(index, amp, talt) { // full rotation per sec @ 60fps
		return zero.core.trig.segs(60, amp)[((index || 0) + (talt || zero.core.util.ticker)) % 60];
	},
	segs: function(segs, amp) {
		var _ = zero.core.trig._, inc, i;
		if (!_.sin[segs]) {
			inc = Math.PI * 2 / segs;
			_.sin[segs] = [];
			for (i = 0; i < segs; i++)
				_.sin[segs].push(Math.sin(inc * i));
		}
		if (amp) {
			if (!_.amps[segs])
				_.amps[segs] = {};
			if (!_.amps[segs][amp])
				_.amps[segs][amp] = _.sin.map(v => v * amp);
			return _.amps[seg][amp];
		}
		return _.sin[segs];
	}
};