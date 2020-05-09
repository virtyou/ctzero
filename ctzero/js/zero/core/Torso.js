zero.core.Torso = CT.Class({
	CLASSNAME: "zero.core.Torso",
	tick: function() {
		for (var side in this.arms) {
			this.arms[side].tick();
			this.legs[side].tick();
		}
	},
	_pass: function(opts, action) {
		var thaz = this;
		["left", "right"].forEach(function(side) {
			if (opts[side]) {
				thaz.arms[side][action](opts[side]);
				thaz.legs[side][action](opts[side].leg);
			}
		});
	},
	move: function(opts) {
		this._pass(opts, "move");
	},
	resize: function(opts) {
		this._pass(opts, "resize");
	},
	energy: function() {
		return this.body && this.body.energy();
	},
	setLimbs: function() {
		var thiz = this, bones = this.bones;
		this.legs = {};
		this.arms = {};
		this.hands = {};

		["left", "right"].forEach(function(side) {
			thiz.legs[side] = new zero.core.Leg({
				side: side,
				parent: thiz,
				bones: bones,
				body: thiz.body,
				bonemap: thiz.bmap[side].leg
			});
			thiz.arms[side] = new zero.core.Arm({
				side: side,
				parent: thiz,
				bones: bones,
				body: thiz.body,
				bonemap: thiz.bmap[side]
			});
			thiz.hands[side] = thiz.arms[side].hand;
		});
	},
	setBone: function() {
		this.bones = this.opts.bones;
		this.bmap = this.opts.bmap;
		this.body = this.opts.body;
		this.setLimbs();
	}
}, zero.core.Thing);