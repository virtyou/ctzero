zero.core.Torso = CT.Class({
	CLASSNAME: "zero.core.Torso",
	tick: function() {
		for (var side in this.arms) {
			this.arms[side].tick();
			this.legs[side].tick();
		}
	},
	move: function(opts) {
		var thaz = this;
		["left", "right"].forEach(function(side) {
			thaz.arms[side].move(opts[side]);
			thaz.legs[side].move(opts[side].leg);
		});		
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
			thiz.legs[side] = new zero.core.Leg({
				side: side,
				parent: thiz,
				bones: bones,
				bonemap: thiz._bmap[side].leg
			});
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

		this._bmap = this.geojson.bonemap;
		this.setLimbs();
	},
	setBody: function(bod) {
		this.body = bod;
		for (var side in this.arms) {
			this.arms[side].setBody(bod);
			this.legs[side].setBody(bod);
		}
	},
	init: function() {
		this.opts.frustumCulled = false; // TODO: fix!
	}
}, zero.core.Thing);