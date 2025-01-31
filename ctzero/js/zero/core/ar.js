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
	start: function(akey) {
		var zcar = zero.core.ar;
		if (akey)
			CT.db.one(akey, zcar.load);
		else // avoid direct one reference
			zcar.load(templates.one.ar.anchors);
//			zcar.load(templates.one.ar[CT.data.choice(["anchors", "location"])]);
	}
};

CT.require("zero.core.ar.anchors");
CT.require("zero.core.ar.location");