zero.core.Garment = CT.Class({
	CLASSNAME: "zero.core.Garment",
	preassemble: function() {
		const oz = this.opts, pz = oz.parts,
			rz = oz.rigids, ammo = zero.core.ammo;
		let i, p;
		this.cloths = [];
		for (i = 0; i < pz.length; i++) {
			p = pz[i];
			p.garment = this;
			if (oz.texture)
				p.texture = oz.texture;
			if (rz.includes(p.name))
				p.onbuild = (thing) => ammo.kineBody(thing.thring, thing.opts.friction);
			if (p.thing == "Cloth")
				this.cloths.push(p.name);
		}
	},
	onremove: function() {
		for (let r of this.opts.rigids)
			zero.core.ammo.unKinematic(this[r].thring);
	},
	setTexture: function(tx) {
		const uobj = { texture: tx };
		this.update(uobj);
		this.parts.forEach(p => p.update(uobj));
	},
	fixBounds: function(p) {
		if (!this.isReady())
			return this.log("skipping fixBounds() - not ready");
		for (let cloth of this.cloths)
			zero.core.util.update(p, this[cloth].thring.geometry.boundingSphere.center);
	},
	init: function(opts) {
		const bodpart = this.opts.bodpart = this.opts.kind.split("_").pop();
		this.opts = opts = CT.merge(zero.base.clothes[bodpart][this.opts.name], opts, {
			rigids: []
		}, this.opts);
	}
}, zero.core.Thing);