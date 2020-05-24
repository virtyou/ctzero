zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	dims: ["x", "y", "z", "curl"],
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
		setJoint(digit, "curl");
		this[digit] = bmap[digit].map(function(knuckle, i) {
			return bones[knuckle];
		});
	},
	shouldReverse: function(part, dim) {
		return part != "thumb" && (dim == "z" || dim == "curl");
	},
	curl: function(degree) {
		var digit, opts = {};
		for (digit of zero.core.Hand.parts)
			opts[digit] = { curl: degree };
		this.move(opts);
	},
	grasp: function() {
		this.curl(1.5);
	},
	release: function() {
		this.curl(0);
	},
	move: function(opts) {
		var digit;
		this.setSprings(opts);
		for (digit in opts) {
			if ("curl" in opts[digit])
				this.springs[digit + "_curl"].target = opts[digit].curl;
		}
	},
	resize: function(opts) {
		var part, thaz = this;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				thaz[part][0].scale[dim] = val;
			});
		}
	},
	tickPart: function(digit) {
		var major, minor, knuckle, cval = this.aspects[digit + "_curl"].value;
		[major, minor] = this.majMin(digit);
		zero.core.util.update(this.rotation(digit), this[digit][0].rotation);
		for (knuckle = 1; knuckle < this[digit].length; knuckle++)
			this[digit][knuckle].rotation[major] = cval;
	}
}, zero.core.Skeleton);

zero.core.Hand.parts = ["thumb", "pointer", "middle", "ring", "pinkie"];
zero.core.Hand.parts.forEach(function(digit) {
    zero.base.aspects.hand[digit] = (digit == "thumb") ? {
        x: {
            max: 0.3,
            min: -0.6
        },
        z: {
            max: 0.2,
            min: -0.4
        },
        curl: {
            max: 1.5,
            min: -0.2
        }
    } : {
        z: {
            max: 1.5,
            min: 0
        },
        x: {
            max: 0.1,
            min: -0.1
        },
        curl: {
            max: 1.5,
            min: -0.2
        }
    };
});
