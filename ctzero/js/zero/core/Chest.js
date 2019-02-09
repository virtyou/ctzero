zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	_bmap: {
		left: 3,
		right: 25
	},
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();

		// TODO: wire up arms! -- the following doesn't work :-\
		var k, b, bones = this.thring.skeleton.bones;
		for (k in this._bmap) {
			b = this[k] = bones[this._bmap[k]];
			this.opts.scene.add(b);
		}
	}
}, zero.core.Thing);