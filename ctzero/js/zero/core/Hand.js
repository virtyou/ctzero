zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoints: function() {
		var digit, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			springs = this.springs = {};
		for (digit in bmap) {
			this[digit] = bmap[digit].map(function(knuckle, i) {
				["x", "y", "z"].forEach(function(dim) {
					var sname = digit + "_" + i + "_" + dim;
					springs[sname] = zero.core.springController.add({
						k: 20,
						damp: 10
					}, sname, thiz);
				});
				return bones[knuckle];
			});
		}
	},
	rotation: function(digit, knuckle) {
		return {
			x: this.springs[digit + "_" + knuckle + "_x"].value,
			y: this.springs[digit + "_" + knuckle + "_y"].value,
			z: this.springs[digit + "_" + knuckle + "_z"].value
		}
	},
	tick: function() {
		var knuckle, thiz = this;
		["thumb", "pointer", "middle", "ring", "pinky"].forEach(function(digit) {
			for (knuckle = 0; knuckle < thiz[digit].length; knuckle++)
				zero.core.util.update(thiz.rotation(digit, knuckle), thiz[digit][knuckle].rotation);
		});
	},
	move: function(opts) {
		var part, val, springs = this.springs;
		for (part in opts) {
			if (!Array,isArray(opts[part])) {
				val = opts[part];
				opts[part] = this[part].map(function() { return val; });
			}
			opts[part].forEach(function(xyz, knuckle) {
				zero.core.util.coords(xyz, function(dim, val) {
					springs[part + "_" + knuckle + "_" + dim].target = val;
				});
			});
		}
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