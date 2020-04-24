zero.core.Skeleton = CT.Class({
	CLASSNAME: "zero.core.Skeleton",
	dims: ["x", "y", "z"],
	bmap: function() {
		return this.opts.bonemap;
	},
	setJoints: function() {
		var part, bmap = this.bmap();
		this.springs = {};
		this.aspects = {};
		for (part in bmap)
			this.setPart(bmap, part);
	},
	setPart: function(bmap, part) {
		var jrules = this.jointRules(part),
			bones = this.opts.bones,
			setJoint = this.setJoint;
		this[part] = bones[bmap[part]];
		Object.keys(jrules).forEach(function(dim) {
			setJoint(part, dim, jrules[dim]);
		});
	},
	rotation: function(part) {
		var r = {}, asp, asps = this.aspects;
		this.dims.forEach(function(dim) {
			asp = asps[part + "_" + dim];
			if (asp)
				r[dim] = asp.value;
		});
		return r;
	},
	tickPart: function(part) {
		zero.core.util.update(this.rotation(part), this[part].rotation);
	},
	tick: function() {
		zero.core[this.variety].parts.forEach(this.tickPart);
	},
	jointRules: function(part, dim) {
		var pdata = zero.base.aspects[this.vlower][part];
		if (dim)
			return pdata[dim];
		return pdata;
	},
	setJoint: function(part, dim, jrules) {
		var aspringz = {}, bspringz = {},
			sname = part + "_" + dim,
			rs = CT.data.choice(["twist", "bow",
				"lean", "shake", "nod", "tilt"]),
			ps = CT.data.choice(["ah", "ee", "ow",
				"ff", "m", "n", "th"]),
			fs = CT.data.choice(["asym", "smileEyes",
				"lids", "smile", "bigSmile", "brow",
				"browAsym", "browSad", "frown"]);
		jrules = jrules || this.jointRules(part, dim);
		this.springs[sname] = zero.core.springController.add({
			k: 20,
			damp: 10
		}, sname, this);
		aspringz[sname] = 1;
		bspringz[rs] = 1 - Math.random() * 2;
		bspringz[ps] = 0.1 - Math.random() * 0.2;
		bspringz[fs] = 0.05 - Math.random() * 0.1;
		if (this.opts.side == "left" && this.shouldReverse(part, dim)) {
			jrules = {
				max: -jrules.min,
				min: -jrules.max
			};
		}
		this.aspects[sname] = zero.core.aspectController.add(CT.merge({
			springs: aspringz,
			bsprings: bspringz
		}, jrules), sname, this);
	},
	shouldReverse: function(part, dim) {
		return dim == "z";
	},
	setSprings: function(opts) {
		var part, springs = this.springs;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				springs[part + "_" + dim].target = val;
			});
		}
	},
	move: function(opts) {
		this.setSprings(opts);
	},
	energy: function() {
		return this.parent.energy();
	},
	build: function() {
		this.setJoints();
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			bones: [],
			bonemap: {}
		});
		this.variety = this.CLASSNAME.split(".")[2];
		this.vlower = this.variety.toLowerCase(); // should these be automated by CT.Class?
		this.parent = opts.parent;
		this.build();
	}
});