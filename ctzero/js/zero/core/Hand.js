zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	majMin: function(digit) {
		if (digit == "thumb")
			return ["x", "z"];
		else
			return ["z", "x"];
	},
	setPart: function(bmap, digit) {
		var bones = this.opts.bones,
			setJoint = this.setJoint;
		this.majMin(digit).forEach(function(dim) {
			setJoint(digit, dim);
		});
		this[digit] = bmap[digit].map(function(knuckle, i) {
			return bones[knuckle];
		});
	},
	tickPart: function(digit) {
		var major, minor, knuckle, zval;
		[major, minor] = this.majMin(digit);
		this[digit][0].rotation.x = this.aspects[digit + "_" + minor].value;
		zval = this.aspects[digit + "_" + major].value;
		for (knuckle = 0; knuckle < this[digit].length; knuckle++)
			this[digit][knuckle].rotation.z = zval;
	}
}, zero.core.Skeleton);

zero.core.Hand.parts = ["thumb", "pointer", "middle", "ring", "pinkie"];
zero.core.Hand.parts.forEach(function(digit) {
    zero.base.aspects.hand[digit] = (digit == "thumb") ? {
        x: {
            max: 0.3,
            min: -0.2
        },
        z: {
            max: 0.2,
            min: -0.4
        }
    } : {
        z: {
            max: 1.5,
            min: 0
        },
        x: {
            max: 0.1,
            min: -0.1
        }
    };
});
