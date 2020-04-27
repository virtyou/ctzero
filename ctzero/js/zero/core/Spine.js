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
		var zcsp = zero.core.Spine.parts,
			rz = this.rotation(part);
		zero.core.util.update(rz, this[part].rotation);
		zero.core.util.update(rz,
			this.opts.hbones[zcsp.indexOf(part)].rotation);
	},
	jointRules: function(part, dim) {
		var pi = zero.core.Spine.parts.indexOf(part),
			pdata = this.body.opts.joints[pi].rotation;
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
zero.core.Spine.parts = ["pelvis", "lumbar", "ribs", "neck", "head"]