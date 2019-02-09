zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	_bmap: {
		left: {
			shoulder: 4,
			elbo: 5
		},
		right: {
			shoulder: 26,
			elbo: 27
		}
	},
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();

		var side, bones = this.thring.skeleton.bones;
		this.opts.scene.add(bones[0]);

		bones[0].position.y = 0; // HACK! fix this...

		this.arms = {};
		for (side in this._bmap) {
			this.arms[side] = new zero.core.Arm({
				parent: this,
				bones: bones,
				bonemap: this._bmap[side]
			});
		}
	}
}, zero.core.Thing);