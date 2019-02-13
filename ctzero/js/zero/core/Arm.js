zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	setJoints: function() {
		var part, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			sname, aspringz, dimz,
			springs = this.springs = {},
			aspects = this.aspects = {};
		for (part in bmap.arm) {
			this[part] = bones[bmap.arm[part]];
			dimz = zero.base.aspects.arm[part];
			Object.keys(dimz).forEach(function(dim) {
				sname = part + "_" + dim;
				springs[sname] = zero.core.springController.add({
					k: 20,
					damp: 10
				}, sname, thiz);
				aspringz = {};
				aspringz[sname] = 1;
				aspects[sname] = zero.core.aspectController.add(CT.merge({
					springs: aspringz
				}, dimz[dim]), sname, thiz);
			});
		}
		this.hand = new zero.core.Hand({
			parent: this,
			bones: bones,
			bonemap: bmap.hand
		});
	},
	rotation: function(part) {
		var r = {}, asp, asps = this.aspects;
		["x", "y", "z"].forEach(function(dim) {
			asp = asps[part + "_" + dim];
			if (asp)
				r[dim] = asp.value;
		});
		return r;
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