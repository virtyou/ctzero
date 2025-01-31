zero.core.ar = {
	tick: function() {
		var zcar = zero.core.ar;
		zcar[zcar.mode].tick();
	},
	build: function() {
		var zcar = zero.core.ar;
		zcar[zcar.mode].build();
	},
	resize: function(renderer) {
		var zcar = zero.core.ar;
		zcar[zcar.mode].resize(renderer);
	},
	load: function(augmentation) {
		var zcar = zero.core.ar;
		zcar.mode = augmentation.variety;
		CT.scriptImport(core.config.ctzero.lib.ar[zcar.mode],
			() => zcar[zcar.mode].start(augmentation));
	},
	populate: function(collection, builder) {
		var zcar = zero.core.ar,
			mcfg = core.config.ctzero.camera.ar[collection], m,
			keys = Object.values(mcfg).filter(i => typeof i == "string");
		if (!keys.length)
			return builder();
		CT.db.multi(keys, function(things) {
			things.forEach(function(thing) {
				for (m in mcfg)
					if (mcfg[m] == thing.key)
						mcfg[m] = thing;
			});
			builder();
			CT.cc.views(zcar.components());
		}, "json");
	},
	components: function() {
		var aug = core.config.ctzero.camera.ar, compz = [{
			identifier: "Augmentation: " + aug.name,
			owners: aug.owners
		}];
		Object.values(aug.markers).forEach(function(thing) {
			compz = compz.concat(zero.core.util.components(thing, aug.name));
		});
		return compz;
	},
	start: function(akey) {
		var zcar = zero.core.ar;
		if (akey)
			CT.db.one(akey, zcar.load);
		else // avoid direct one reference
//			zcar.load(templates.one.ar.location);
			zcar.load(templates.one.ar.anchors);
//			zcar.load(templates.one.ar[CT.data.choice(["anchors", "location"])]);
	}
};

CT.require("zero.core.ar.anchors");
CT.require("zero.core.ar.location");