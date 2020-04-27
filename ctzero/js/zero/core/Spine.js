zero.core.Spine = CT.Class({
	CLASSNAME: "zero.core.Spine",
	bmap: function() {
		var bz = {};
		zero.core.Spine.parts.forEach(function(p, i) {
			bz[p] = i;
		});
		return bz;
	},
	tickPart: function(part) {
		var zcst = zero.core.Spine.trunc,
			rz = this.rotation(part);
		zero.core.util.update(rz, this[part].rotation);
		if (part != "ribs" && zcst.includes(part))
			zero.core.util.update(rz,
				this.opts.hbones[zcst.indexOf(part)].rotation);
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
zero.core.Spine.trunc = ["ribs", "neck", "head"];
zero.core.Spine.parts = ["pelvis", "lumbar", "ribs", "neck", "head"]