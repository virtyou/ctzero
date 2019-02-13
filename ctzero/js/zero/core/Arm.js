zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	setJoints: function() {
		var part, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			sname, aspringz,
			springs = this.springs = {},
			aspects = this.aspects = {};
		for (part in bmap.arm) {
			this[part] = bones[bmap.arm[part]];
			["x", "y", "z"].forEach(function(dim) {
				sname = part + "_" + dim;
				springs[sname] = zero.core.springController.add({
					k: 20,
					damp: 10
				}, sname, thiz);
				aspringz = {};
				aspringz[sname] = 1;
				aspects[sname] = zero.core.aspectController.add({
					springs: aspringz
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
			x: this.aspects[part + "_x"].value,
			y: this.aspects[part + "_y"].value,
			z: this.aspects[part + "_z"].value
		}
	},
	tick: function() {
		var thiz = this;
		zero.core.Arm.parts.forEach(function(part) {
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
	energy: function() {
		return this.parent.energy();
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {}
		});
		this.parent = opts.parent;
		this.setJoints();
	}
});
zero.core.Arm.parts = ["shoulder", "elbow", "wrist"];