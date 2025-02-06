zero.core.ar = {
	_: {
		vidsies: ["video", "program"],
		m2k: function(mcfg) {
			var m, kz = [];
			for (m of Object.values(mcfg)) {
				if (typeof m == "string")
					kz.push(m);
				else if (m.justkey)
					kz.push(m.justkey);
			}
			return kz;
		},
		latlng: function() {
			var zcar = zero.core.ar,
				llpos = () => CT.data.choice([-zcar.unit, zcar.unit]);
			return { latitude: llpos(), longitude: llpos() };
		},
		qs2aug: function(aqs) {
			var zcar = zero.core.ar, aug = {
				things: [],
				lights: [{}],
				name: "custom",
				variety: "relocation"
			}, latlng = zcar._.latlng, kind, val;
			for (pair of aqs.split("&")) {
				[kind, val] = pair.split("=");
				aug.things.push(CT.merge(zcar.item(kind, val), latlng()));
			}
			return aug;
		}
	},
	unit: 0.00004,
	viddy: function(variety) {
		return zero.core.ar._.vidsies.includes(variety);
	},
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
		if (aug.variety == "relocation") {
			aug.variety = "location";
			aug.relative = true;
		}
		zcar.mode = aug.variety;
		zcar.aug = zcfg.camera.ar = CT.merge(aug); // necessary?
		CT.scriptImport(zcfg.lib.ar[zcar.mode], zcar.run);
	},
	fromPeople: function(name, cb) {
		var p, zc = zero.core, _ = zc.ar._,
			ranPer = () => CT.data.choice(Object.values(_.people)),
			byName = () => cb(_.people[name] || ranPer());
		if (_.people)
			return byName();
		CT.db.get("person", function(pz) {
			_.people = {};
			for (p of pz)
				_.people[p.name] = p;
			byName();
		}, null, null, null, null, false, false, "json");
	},
	getPerson: function(persig, cb) {
		if (persig.length > 40)
			return CT.db.one(persig, cb, "json");
		zero.core.ar.fromPeople(persig, cb);
	},
	person: function(p, bprep, onjoin) {
		var zc = zero.core, zcar = zc.ar, gotPer;
		zcar.getPerson(p, function(per) {
			bprep && bprep(per.body);
			per.body.onclick = function() {
				gotPer.orient(zc.camera);
				zc.audio.ux("blipon");
				gotPer.engage();
			};
			gotPer = zc.util.join(per, onjoin, true);
		});
	},
	populate: function(collection, builder) {
		var mcfg = core.config.ctzero.camera.ar[collection],
			zcar = zero.core.ar, keys = zcar._.m2k(mcfg), m;
		if (!keys.length)
			return builder();
		CT.db.multi(keys, function(things) {
			things.forEach(function(thing) {
				for (m in mcfg)
					if (mcfg[m] == thing.key)
						mcfg[m] = thing;
					else if (mcfg[m].justkey == thing.key)
						mcfg[m] = CT.merge(mcfg[m], thing);
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
	item: function(kind, val) {
		var zcar = zero.core.ar, item = { kind: kind };
		if (zcar.viddy(kind)) {
			item.autoplay = "tap";
			item.planeGeometry = [3, 3];
			if (val) {
				item.name = val.split("/").pop();
				item.video = val;
			}
		} else if (kind == "swarm") {
			item.name = val; // TODO: avoid direct one reference
			item.thing = "Swarm";
			item.frames = templates.one.vswarm[val];
		} else if (kind == "person")
			item.person = val.name || val;
		else
			item.justkey = val.key || val;
		return item;
	},
	start: function(akey) {
		var zcar = zero.core.ar, pair, key, val, aug;
		if (akey) {
			return (akey.includes("=")) ? zcar.load(zcar._.qs2aug(akey))
				: CT.db.one(akey, zcar.load);
		}
		CT.modal.choice({
			prompt: "anchors or location?",
			data: ["location", "anchors"],
			cb: arvar => zcar.load(CT.module("templates.one.ar")[arvar])
		});
	}
};

CT.require("zero.core.ar.anchors");
CT.require("zero.core.ar.location");