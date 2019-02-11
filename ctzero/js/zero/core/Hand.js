zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoints: function() {
		var digit, oz = this.opts, thiz = this,
			bones = oz.bones, bmap = oz.bonemap,
			springs = this.springs = {};
		for (digit in bmap) {
			this[digit] = bmap[digit].map(function(knuckle, i) {
				var sname = digit + "_" + i;
				springs[sname] = zero.core.springController.add({
					k: 20,
					damp: 10
				}, sname, thiz);
				return bones[knuckle];
			});
		}
	},
	tick: function() {
		var knuckle, thiz = this;
		["thumb", "pointer", "middle", "ring", "pinkie"].forEach(function(digit) {
			for (knuckle = 0; knuckle < thiz[digit].length; knuckle++)
				thiz[digit][knuckle].rotation.z = thiz.springs[digit + "_" + knuckle].value;
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