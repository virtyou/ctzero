zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	setJoints: function() {
		var part, oz = this.opts,
			bones = oz.bones, bmap = oz.bonemap;
		for (part in bmap.arm)
			this[part] = bones[bmap.arm[part]];
		this.hand = new zero.core.Hand({
			bones: bones,
			bonemap: bmap.hand
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {}
		});
		this.setJoints();
	}
});