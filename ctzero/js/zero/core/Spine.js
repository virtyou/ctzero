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
	aspRules: function(sname) {
		var aspringz = {};
		aspringz[sname] = 1;
		return {
			springs: aspringz
		};
	}
}, zero.core.Skeleton);
zero.core.Spine.parts = ["pelvis", "torso", "neck"];