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
	aspRules: function(sname) {
		var aspringz = {}, bspringz = {}, hspringz = {},
			rs = CT.data.choice(["twist", "bow",
				"lean", "shake", "nod", "tilt"]),
			ps = CT.data.choice(["ah", "ee", "ow",
				"ff", "m", "n", "th"]),
			fs = CT.data.choice(["asym", "smileEyes",
				"smile", "bigSmile", "brow",
				"browAsym", "browSad", "frown"]);
		aspringz[sname] = 1;
		bspringz[rs] = 1 - Math.random() * 2;
		hspringz[ps] = 0.025 - Math.random() * 0.05;
		hspringz[fs] = 0.025 - Math.random() * 0.05;
		return {
			springs: aspringz,
			bsprings: bspringz,
			hsprings: hspringz
		};
	},
	setJoint: function(part, dim, jrules) {
		var sname = part + "_" + dim, rz, jmax;
		jrules = jrules || this.jointRules(part, dim);
		this.springs[sname] = zero.core.springController.add({
			k: 40,
			damp: 10
		}, sname, this);
		if (this.opts.side == "left" && this.shouldReverse(part, dim)) {
			jmax = jrules.max;
			jrules.max = -jrules.min;
			jrules.min = -jmax;
		}
		rz = CT.merge(this.aspRules(sname), jrules);
		["springs", "bsprings", "hsprings"].forEach(function(sz) {
			rz[sz] = CT.merge(jrules[sz], rz[sz]);
		});
		this.aspects[sname] = zero.core.aspectController.add(rz, sname, this);
	},
	setBody: function(bod) {
		this.body = bod;
	},
	shouldReverse: function(part, dim) {
		return dim == "z";
	},
	partUp: function(part, rotation) {
		var springs = this.springs;
		zero.core.util.coords(rotation, function(dim, val) {
			springs[part + "_" + dim].target = val;
		});
	},
	point: function(part, thing) {
		var p = this[part], v = zero.core.util.vector(p.position,
			p.worldToLocal(thing.position(null, true)));
		this.springs[part + "_x"].target = -(Math.atan(v.y / v.z) + Math.PI / 2);
	},
	setSprings: function(opts) {
		for (var part in opts)
			this.partUp(part, opts[part]);
	},
	setScales: function(opts) {
		var part, thaz = this;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				thaz[part].scale[dim] = val;
			});
		}
	},
	move: function(opts) {
		this.setSprings(opts);
	},
	resize: function(opts) {
		this.setScales(opts);
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
		this.parent = opts.parent || opts.body;
		opts.body && this.setBody(opts.body);
		this.build();
	}
});