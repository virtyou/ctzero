zero.core.trig = {
	_: {
		amps: {},
		ratio: 30 / Math.PI
	},
	sin: function(angle) {
		return zero.core.trig.sin60(Math.round(zero.core.trig._.ratio * angle));
	},
	sin60: function(index, amp, talt) {
		return zero.core.trig.amp(amp)[((index || 0) + (talt || zero.core.util.ticker)) % 60];
	},
	amp: function(amp) {
		var _ = zero.core.trig._, inc, i;
		if (!_.sin) {
			inc = 1 / _.ratio;
			_.sin = [];
			for (i = 0; i < 60; i++)
				_.sin.push(Math.sin(inc * i));
		}
		if (amp) {
			if (!_.amps[amp])
				_.amps[amp] = _.sin.map(v => v * amp);
			return _.amps[amp];
		}
		return _.sin;
	}
};