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
	majMin: function(digit) {
		if (digit == "thumb")
			return ["x", "y"];
		else
			return ["z", "x"];
	},
	setJoints: function() {
		var digit, oz = this.opts, setJoint = this.setJoint,
			bones = oz.bones, bmap = oz.bonemap;
		this.springs = {};
		this.aspects = {};
		for (digit in bmap) {
			this.majMin(digit).forEach(function(dim) {
				setJoint(digit, dim);
			});
			this[digit] = bmap[digit].map(function(knuckle, i) {
				return bones[knuckle];
			});
		}
	},
	tick: function() {
		var major, minor, majMin = this.majMin,
			thiz = this, knuckle, zval;
		zero.core.Hand.parts.forEach(function(digit) {
			[major, minor] = majMin(digit);
			thiz[digit][0].rotation.x = thiz.aspects[digit + "_" + minor].value;
			zval = thiz.aspects[digit + "_" + major].value;
			for (knuckle = 0; knuckle < thiz[digit].length; knuckle++)
				thiz[digit][knuckle].rotation.z = zval;
		});
	},
	move: function(opts) {
		var part, springs = this.springs;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				springs[part + "_" + dim].target = val;
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
    zero.base.aspects.hand[digit] = (digit == "thumb") ? {
        x: {
            max: 0.3,
            min: -0.2
        },
        y: {
            max: 0.2,
            min: -0.6
        }
    } : {
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
