zero.core.Spine = CT.Class({
	CLASSNAME: "zero.core.Spine",
	bmap: function() {
		var bz = {};
		zero.core.Spine.parts.forEach(function(p, i) {
			bz[p] = i;
		});
		return bz;
	},
	jointRules: function(part, dim) {
		var pi = zero.core.Spine.parts.indexOf(part),
			pdata = this.parent.opts.joints[pi].rotation;
		if (dim)
			return pdata[dim];
		return pdata;
	},
	setJoint: function(part, dim, jrules) {
		var sname = part + "_" + dim;
		this.aspects[sname] = zero.core.aspectController.add(jrules
			|| this.jointRules(part, dim), sname, this);
	},
	setSprings: function(opts) {
		var part, asps = this.aspects;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				asps[part + "_" + dim].shift(val);
			});
		}
	}
}, zero.core.Skeleton);
//zero.core.Spine.parts = ["pelvis", "lumbar", "ribs", "neck", "head"];
zero.core.Spine.parts = ["pelvis", "torso", "neck"];
//zero.core.Spine.parts = ["pelvis", "ribs", "neck"];
//zero.core.Spine.parts = ["lumbar", "ribs", "neck"];
