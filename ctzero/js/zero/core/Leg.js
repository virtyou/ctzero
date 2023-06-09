zero.core.Leg = CT.Class({
	CLASSNAME: "zero.core.Leg",
	_kicker: {hip: {x: -2}},
	_unkicker: {hip: {x: 0}},
	kick: function() {
		this.setSprings(this._kicker);
	},
	unkick: function() {
		this.setSprings(this._unkicker);
	}
}, zero.core.Skeleton);
zero.core.Leg.parts = ["hip", "knee", "ankle", "toe"];