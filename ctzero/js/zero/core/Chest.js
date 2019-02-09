zero.core.Chest = CT.Class({
	CLASSNAME: "zero.core.Chest",
	setBone: function() {
		this.bones = this.opts.bones.slice();
		this.bone = this.bones.shift();
		// TODO: wire up arms
	}
}, zero.core.Thing);