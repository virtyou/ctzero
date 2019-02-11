zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	tick: function() {
		for (var arm in this.arms)
			this.arms[arm].tick();
	},
	move: function(opts) {
		for (var side in opts)
			this.arms[side].move(opts[side]);
	},
	energy: function() {
		return this.body && this.body.energy();
	},
	setArms: function() {
		var thiz = this, bones = this.thring.skeleton.bones;
		this.arms = {};

		// faster way to get bmap, such as from three somehow?
		this._bmap = CT.net.get(this.opts.stripset, null, true).bonemap;

		["left", "right"].forEach(function(side) {
			thiz.arms[side] = new zero.core.Arm({
				parent: thiz,
				bones: bones,
				bonemap: thiz._bmap[side]
			});
		});
	},
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();

		var bones = this.thring.skeleton.bones;
		this.opts.scene.add(bones[0]);
		bones[0].position.y = -14; // HACK! fix this...

		this.setArms();
	}
}, zero.core.Thing);