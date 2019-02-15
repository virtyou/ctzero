zero.core.Skeleton = CT.Class({
	CLASSNAME: "zero.core.Skeleton",
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
		["x", "y", "z"].forEach(function(dim) {
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
		var aspringz, sname = part + "_" + dim;
		jrules = jrules || this.jointRules(part, dim);
		this.springs[sname] = zero.core.springController.add({
			k: 20,
			damp: 10
		}, sname, this);
		aspringz = {};
		aspringz[sname] = 1;
		if (this.opts.side == "left" && dim == "z") {
			jrules = {
				max: -jrules.min,
				min: -jrules.max
			};
		}
		this.aspects[sname] = zero.core.aspectController.add(CT.merge({
			springs: aspringz
		}, jrules), sname, this);
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