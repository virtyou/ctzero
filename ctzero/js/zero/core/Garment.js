zero.core.Garment = CT.Class({
	CLASSNAME: "zero.core.Garment",
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts;
		if (!oz.texture) return;
		for (i = 0; i < pz.length; i++)
			pz[i].texture = oz.texture;
	},
	setTexture: function(tx) {
		var uobj = { texture: tx };
		this.update(uobj);
		this.parts.forEach(p => p.update(uobj));
	},
	init: function(opts) {
		var bodpart = this.opts.bodpart = this.opts.kind.split("_").pop();
		this.opts = opts = CT.merge(zero.base.clothes[bodpart][this.opts.name], opts, {

		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Garment.Cloth = CT.Class({
	CLASSNAME: "zero.core.Garment.Cloth",
	preassemble: function() {
		
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {

		}, this.opts);
	}
}, zero.core.Thing);