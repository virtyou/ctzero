zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoints: function() {
		var digit, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			sname, aspringz,
			springs = this.springs = {},
			aspects = this.aspects = {};
		for (digit in bmap) {
			this[digit] = bmap[digit].map(function(knuckle, i) {
				sname = digit + "_" + i;
				springs[sname] = zero.core.springController.add({
					k: 20,
					damp: 10
				}, sname, thiz);
				aspringz = {};
				aspringz[sname] = 1;
				aspects[sname] = zero.core.aspectController.add({
					springs: aspringz
				}, sname, thiz);
				return bones[knuckle];
			});
		}
	},
	tick: function() {
		var knuckle, thiz = this;
		["thumb", "pointer", "middle", "ring", "pinkie"].forEach(function(digit) {
			for (knuckle = 0; knuckle < thiz[digit].length; knuckle++)
				thiz[digit][knuckle].rotation.z = thiz.aspects[digit + "_" + knuckle].value;
		});
	},
	move: function(opts) {
		var part, val, springs = this.springs;
		for (part in opts) {
			if (!Array.isArray(opts[part])) {
				val = opts[part];
				opts[part] = this[part].map(function() { return val; });
			}
			opts[part].forEach(function(xyz, knuckle) {
				springs[part + "_" + knuckle].target = val;
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