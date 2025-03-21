zero.core.Stairs = CT.Class({
	CLASSNAME: "zero.core.Stairs",
	getTop: function(pos) {
		const step = this.getKind("step", pos, true), bz = this.bounds;
		return step ? step.getTop(pos) : bz.min.y;
	},
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, sm1 = oz.steps - 1,
			sbg = [oz.width, oz.height, oz.depth],
			roz = zero.core.current.room.opts, mat = this.getMaterial();
		let i, y = -sm1 * oz.height / 2,
			z = sm1 * oz.depth / 2;
		for (i = 0; i < oz.steps; i++) {
			pz.push({
				kind: "step",
				name: "step" + i,
				matinstance: mat,
				boxGeometry: sbg,
				position: [0, y, z],
				castShadow: roz.shadows,
				receiveShadow: roz.shadows,
			});
			y += oz.height;
			z -= oz.depth;
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			steps: 7,
			depth: 20,
			width: 80,
			height: 10
		}, this.opts);
	}
}, zero.core.Thing);