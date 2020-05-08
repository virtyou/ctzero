zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	bmap: function() {
		return this.opts.bonemap.arm;
	},
	move: function(opts) {
		this.setSprings(opts.arm);
		this.hand.move(opts.hand);
	},
	resize: function(opts) {
		this.setScales(opts.arm);
		this.hand.resize(opts.hand);
	},
	tick: function() {
		zero.core[this.variety].parts.forEach(this.tickPart);
		this.hand.tick();
	},
	setBody: function(bod) {
		this.body = bod;
		this.hand && this.hand.setBody(bod);
	},
	build: function() {
		var oz = this.opts, bones = oz.bones, bmap = oz.bonemap;
		this.setJoints();
		this.hand = new zero.core.Hand({
			parent: this,
			bones: bones,
			body: this.body,
			bonemap: bmap.hand,
			side: this.opts.side
		});
	}
}, zero.core.Skeleton);
zero.core.Arm.parts = ["shoulder", "elbow", "wrist"];