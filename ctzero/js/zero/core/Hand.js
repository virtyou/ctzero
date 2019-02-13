zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	setJoint: function(digit, dim) {
		var aspringz, sname = digit + "_" + dim;
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
			setJoint(digit, "x");
			setJoint(digit, "z");
			this[digit] = bmap[digit].map(function(knuckle, i) {
				return bones[knuckle];
			});
		}
	},
	tick: function() {
		var knuckle, thiz = this, zval;
		zero.core.Hand.parts.forEach(function(digit) {
			thiz[digit][0].rotation.x = thiz.aspects[digit + "_x"].value;
			zval = thiz.aspects[digit + "_z"].value;
			for (knuckle = 0; knuckle < thiz[digit].length; knuckle++)
				thiz[digit][knuckle].rotation.z = zval;
		});
	},
	move: function(opts) {
		var part, val, springs = this.springs;
		for (part in opts) {
			["x", "z"].forEach(function(dim) {
				springs[part + "_" + dim].target = opts[part][dim];
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
            max: 0.1,
            min: -0.1
        }
    };
});
