zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	setJoints: function() {
		var part, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			springs = this.springs = {};
		for (part in bmap.arm) {
			this[part] = bones[bmap.arm[part]];
			["x", "y", "z"].forEach(function(dim) {
				var sname = part + "_" + dim;
				springs[sname] = zero.core.springController.add({
					k: 20,
					damp: 10
				}, sname, thiz);
			});
		}
		this.hand = new zero.core.Hand({
			parent: this,
			bones: bones,
			bonemap: bmap.hand
		});
	},
	rotation: function(part) {
		return {
			x: this.springs[part + "_x"].value,
			y: this.springs[part + "_y"].value,
			z: this.springs[part + "_z"].value
		}
	},
	tick: function() {
		var thiz = this;
		["shoulder", "elbow", "wrist"].forEach(function(part) {
			zero.core.util.update(thiz.rotation(part), thiz[part].rotation);
		});
		this.hand.tick();
	},
	move: function(opts) {
		var part, springs = this.springs;
		for (part in opts.arm) {
			zero.core.util.coords(opts.arm[part], function(dim, val) {
				springs[part + "_" + dim].target = val;
			});
		}
		this.hand.move(opts.hand);
	},
	gesture: function(gname) {
		this.move(this.opts.gestures[gname]);
	},
	energy: function() {
		return this.parent.energy();
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {},
			gestures: {}
		});
		this.parent = opts.parent;
		this.setJoints();
	}
});