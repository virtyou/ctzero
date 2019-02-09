zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	setJoints: function() {
		var part, oz = this.opts,
			bones = oz.bones, bmap = oz.bonemap;
		for (part in bmap)
			this[part] = bones[bmap[part]];
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {}
		});
		this.setJoints();
	}
});