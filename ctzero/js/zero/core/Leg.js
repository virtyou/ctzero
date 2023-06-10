zero.core.Leg = CT.Class({
	CLASSNAME: "zero.core.Leg",
	_kicker: {hip: {x: -2}},
	_unkicker: {hip: {x: 0}},
	foot: {
		name: "foot",
		radii: { x: 10, y: 10, z: 10 }, // HACKY :'(
		position: function(ignoredPos, world) {
			return zero.core.util.getPos(this.toe, world);
		}
	},
	kick: function() {
		this.setSprings(this._kicker);
	},
	unkick: function() {
		this.setSprings(this._unkicker);
	}
}, zero.core.Skeleton);
zero.core.Leg.parts = ["hip", "knee", "ankle", "toe"];