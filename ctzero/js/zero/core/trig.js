class SpringCurve extends THREE.Curve {
	constructor(radius, vertSeg, reps) {
		super();
		this.reps = reps || 1;
		this.radius = radius || 1
		this.vertSeg = vertSeg || 1;
	}
	getPoint(t, optionalTarget = new THREE.Vector3()) {
		const fullrot = 2 * Math.PI, v = (fullrot * t * this.reps) % fullrot;
		return optionalTarget.set(Math.sin(v) * this.radius,
			this.vertSeg * t, Math.cos(v) * this.radius);
	}
}

zero.core.trig = {
	_: {
		sin: {},
		amps: {},
		curves: {}
	},
	curve: function(radius, vertSeg, reps) {
		var cz = zero.core.trig._.curves;
		if (!(radius in cz))
			cz[radius] = {};
		if (!(vertSeg in cz[radius]))
			cz[radius][vertSeg] = {};
		if (!(reps in cz[radius][vertSeg]))
			cz[radius][vertSeg][reps] = new SpringCurve(radius, vertSeg, reps);
		return cz[radius][vertSeg][reps];
	},
	sin: function(angle, amp) { // 628
		var segs = zero.core.trig.segs(628, amp),
			angish = Math.floor(angle * 100),
			val = segs[Math.abs(angish) % 628];
		return angish < 0 ? -val : val;
	},
	sin60: function(index, amp, talt) { // full rotation per sec @ 60fps
		return zero.core.trig.seg(60, amp, index, talt);
	},
	segs: function(segs, amp) {
		var _ = zero.core.trig._, inc, i;
		if (!_.sin[segs]) {
			inc = Math.PI * 2 / segs;
			_.sin[segs] = [];
			for (i = 0; i < segs; i++)
				_.sin[segs].push(Math.sin(inc * i));
		}
		if (amp && amp != 1) {
			if (!_.amps[segs])
				_.amps[segs] = {};
			if (!_.amps[segs][amp])
				_.amps[segs][amp] = _.sin[segs].map(v => v * amp);
			return _.amps[segs][amp];
		}
		return _.sin[segs];
	},
	seg: function(segs, amp, index, talt) {
		var zc = zero.core, i = (index || 0) + (talt || zc.util.ticker);
		return zc.trig.segs(segs, amp)[i % segs];
	}
};