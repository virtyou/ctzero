zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	_bmap: {
		left: {
			arm: {
				shoulder: 4,
				elbo: 5
			},
			hand: {
				thumb: [18, 19, 20],
				pointer: [14, 15, 16, 17],
				middle: [10, 11, 12, 13],
				ring: [21, 22, 23, 24],
				pinky: [6, 7, 8, 9]
			}
		},
		right: {
			arm: {
				shoulder: 26,
				elbo: 27
			},
			hand: {
				thumb: [40, 41, 42],
				pointer: [36, 37, 38, 39],
				middle: [32, 33, 34, 35],
				ring: [43, 44, 45, 46],
				pinky: [28, 29, 30, 31]
			}
		}
	},
	tick: function() {
		this.arms.left.tick();
		this.arms.right.tick();
	},
	move: function(opts) {
		for (var side in opts)
			this.arms[side].move(opts[side]);
	},
	energy: function() {
		return this.body && this.body.energy();
	},
	setArms: function() {
		var side, bones = this.thring.skeleton.bones;
		this.arms = {};
		for (side in this._bmap) {
			this.arms[side] = new zero.core.Arm({
				parent: this,
				bones: bones,
				bonemap: this._bmap[side]
			});
		}
	},
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();

		var bones = this.thring.skeleton.bones;
		this.opts.scene.add(bones[0]);
		bones[0].position.y = 0; // HACK! fix this...

		this.setArms();
	}
}, zero.core.Thing);