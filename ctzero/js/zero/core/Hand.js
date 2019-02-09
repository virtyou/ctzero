zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoints: function() {
		var digit, oz = this.opts,
			bones = oz.bones, bmap = oz.bonemap;
		for (digit in bmap) {
			this[digit] = bmap[digit].map(function(knuckle) {
				return bones[knuckle];
			});
		}
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {}
		});
		this.setJoints();
	}
});