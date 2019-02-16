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
	setLimbs: function() {
		var thiz = this, bones = this.thring.skeleton.bones;
		this.legs = {};
		this.arms = {};
		this.hands = {};

		["left", "right"].forEach(function(side) {
			if (thiz._bmap[side].leg) {
				thiz.legs[side] = new zero.core.Leg({
					side: side,
					parent: thiz,
					bones: bones,
					bonemap: thiz._bmap[side].leg
				});
				delete thiz._bmap[side].leg;
			}
			thiz.arms[side] = new zero.core.Arm({
				side: side,
				parent: thiz,
				bones: bones,
				bonemap: thiz._bmap[side]
			});
			thiz.hands[side] = thiz.arms[side].hand;
		});
	},
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();

		var bones = this.thring.skeleton.bones;
		this.opts.scene.add(bones[0]);
		bones[0].position.y = -3.7; // HACK! fix this...

		// faster way to get bmap, such as from three somehow?
		this._bmap = CT.net.get(this.opts.stripset, null, true).bonemap;
		this.setLimbs();
	}
}, zero.core.Thing);