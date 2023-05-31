zero.core.Hand = CT.Class({
	CLASSNAME: "zero.core.Hand",
	dims: ["x", "y", "z", "curl"],
	radii: { x: 10, y: 10, z: 10 }, // HACKY :'(
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
	curl: function(degree, thumbOnly, fingers) {
		if (thumbOnly)
			return this.move({ thumb: { curl: degree }});
		if (this.opts.side == "left")
			degree *= -1;
		var digit, opts = {};
		for (digit of fingers || zero.core.Hand.fingers)
			opts[digit] = { curl: degree };
		this.move(opts);
	},
	grasp: function() {
		this.curl(1);
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
	},
	position: function(ignoredPos, world) {
		if (ignoredPos)
			return this.log("position ignored");
		var tar = this.middle[0];
		if (!world)
			return tar.position;
		if (!this._positioner)
			this._positioner = new THREE.Vector3();
		return tar.getWorldPosition(this._positioner);
	}
}, zero.core.Skeleton);

zero.core.Hand.parts = ["thumb", "pointer", "middle", "ring", "pinkie"];
zero.core.Hand.fingers = zero.core.Hand.parts.slice(1);
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
