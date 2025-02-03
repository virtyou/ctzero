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
		var zcar = zero.core.ar, resizer = zcar[zcar.mode].resize;
		resizer && resizer(renderer);
	},
	run: function() {
		var zc = zero.core;
		zc.camera.init();
		zc.current.people = {}; // normally in zcu.refresh()
		requestAnimationFrame(zero.core.util.animate);
	},
	load: function(aug) {
		var zcar = zero.core.ar, zcfg = core.config.ctzero;
		zcar.mode = aug.variety;
		zcar.aug = zcfg.camera.ar = CT.merge(aug); // necessary?
		CT.scriptImport(zcfg.lib.ar[zcar.mode], zcar.run);
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
		var zc = zero.core, aug = zc.ar.aug, compz = [{
			identifier: "Augmentation: " + aug.name,
			owners: aug.owners
		}];
		Object.values(aug.markers).forEach(function(thing) {
			compz = compz.concat(zc.util.components(thing, aug.name));
		});
		return compz;
	},
	start: function(akey) {
		var zcar = zero.core.ar;
		if (akey)
			return CT.db.one(akey, zcar.load);
		CT.modal.choice({
			prompt: "anchors or location?",
			data: ["location", "anchors"],
			cb: arvar => zcar.load(templates.one.ar[arvar])
		});
	}
};

CT.require("zero.core.ar.anchors");
CT.require("zero.core.ar.location");