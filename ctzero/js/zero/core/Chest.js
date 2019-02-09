zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	_roots: [3, 25],
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

		// TODO: wire up arms!
		// -- the following doesn't quite work w/ rotations... :-\
		var side, part, b, scene = this.opts.scene,
			bones = this.thring.skeleton.bones;
		this._roots.forEach(function(root) {
			scene.add(bones[root]);
		});
		for (side in this._bmap) {
			this[side] = {};
			for (part in this._bmap[side])
				this[side][part] = bones[this._bmap[side][part]];
		}
	}
}, zero.core.Thing);