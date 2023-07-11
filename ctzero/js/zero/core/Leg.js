zero.core.Leg = CT.Class({
	CLASSNAME: "zero.core.Leg",
	foot: {
		name: "foot",
		radii: { x: 10, y: 10, z: 10 }, // HACKY :'(
		position: function(ignoredPos, world) {
			return zero.core.util.getPos(this.toe, world);
		}
	}
}, zero.core.Skeleton);
zero.core.Leg.parts = ["hip", "knee", "ankle", "toe"];