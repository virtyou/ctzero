zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoint: function(digit, knuckle, dim) {
		var aspringz, sname = digit + "_" + (dim || knuckle); // ie _2 or _x
		this.springs[sname] = zero.core.springController.add({
			k: 20,
			damp: 10
		}, sname, this);
		aspringz = {};
		aspringz[sname] = 1;
		this.aspects[sname] = zero.core.aspectController.add(CT.merge({
			springs: aspringz
		}, zero.base.aspects.hand[digit][dim]), sname, this);
	},
	setJoints: function() {
		var digit, oz = this.opts, setJoint = this.setJoint,
			bones = oz.bones, bmap = oz.bonemap;
		this.springs = {};
		this.aspects = {};
		for (digit in bmap) {
			setJoint(digit, null, "x");
			this[digit] = bmap[digit].map(function(knuckle, i) {
				setJoint(digit, i);
				return bones[knuckle];
			});
		}
	},
	tick: function() {
		var knuckle, thiz = this;
		zero.core.Hand.parts.forEach(function(digit) {
			thiz[digit][0].rotation.x = thiz.aspects[digit + "_x"].value;
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

zero.core.Hand.parts = ["thumb", "pointer", "middle", "ring", "pinkie"];
zero.core.Hand.parts.forEach(function(digit) {
    zero.base.aspects.hand[digit] = {
        z: {
            max: 0,
            min: -1.5
        },
        x: {
            max: 0.2,
            min: -0.2
        }
    };
});
