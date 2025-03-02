zero.core.ar = {
	_: {
		vidsies: ["video", "program"],
		flofies: ["flora", "fauna"],
		garmies: ["garden", "menagerie"],
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
		latlng: function(fronter) {
			var u = zero.core.ar.unit,
				llpos = () => CT.data.choice([-u, u]);
			return {
				latitude: fronter && u || llpos(),
				longitude: !fronter && llpos() || 0
			};
		},
		qs2aug: function(aqs) {
			var zcar = zero.core.ar, aug = {
				things: [],
				lights: [{}],
				name: "custom",
				variety: "relocation"
			}, latlng = zcar._.latlng, pair, kind, val;
			for (pair of aqs.split("&")) {
				[kind, val] = pair.split("=");
				aug.things.push(CT.merge(zcar.item(kind, val),
					latlng(zcar.viddy(kind) || !CT.info.mobile)));
			}
			return aug;
		},
		qload: function(kind, name) {
			var zcar = zero.core.ar;
			zcar.load(zcar._.qs2aug(kind + "=" + name));
		}
	},
	unit: 0.00004,
	garmen: function(variety) {
		return zero.core.ar._.garmies.includes(variety);
	},
	flofa: function(variety) {
		return zero.core.ar._.flofies.includes(variety);
	},
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
	getPeople: function(cb) {
		var p, _ = zero.core.ar._;
		if (_.people)
			return cb(_.people);
		CT.db.get("person", function(pz) {
			_.people = {};
			for (p of pz)
				_.people[p.name] = p;
			cb(_.people);
		}, null, null, null, null, false, false, "json");
	},
	fromPeople: function(name, cb) {
		var zcar = zero.core.ar, _ = zcar._,
			ranPer = () => CT.data.choice(Object.values(_.people)),
			byName = () => cb(_.people[name] || ranPer());
		zcar.getPeople(byName);
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
	loadPerson: function() {
		var zcar = zero.core.ar;
		zcar.getPeople(function(pz) {
			CT.modal.choice({
				prompt: "select someone",
				data: Object.keys(pz),
				cb: name => zcar._.qload("person", name)
			});
		});
	},
	loadItem: function() {
		CT.modal.choice({
			prompt: "select item",
			data: zero.base.clothes.procedurals("held"),
			cb: item => zero.core.ar._.qload("item", item.name)
		});
	},
	loadFlofa: function(variety) {
		var zc = zero.core, _ = zc.ar._, fclass = zc[CT.parse.capitalize(variety)];
		CT.modal.choice({
			prompt: "select " + variety,
			data: [fclass.setter].concat(fclass.kinds),
			cb: function(name) {
				if (name != fclass.setter)
					return _.qload(variety, name);
				CT.modal.choice({
					prompt: "select " + name,
					data: Object.keys(fclass.sets),
					cb: sname => _.qload(name, sname)
				});
			}
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
		var zc = zero.core, zcar = zc.ar, item = { kind: kind };
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
		else if (kind == "item")
			item = zero.base.clothes.procedurals("held", true)[val];
		else if (zcar.flofa(kind)) {
			item.kind = val;
			item.thing = CT.parse.capitalize(kind);
		} else if (zcar.garmen(kind)) {
			item.colclass = (kind == "garden") ? zc.Flora.Garden : zc.Fauna.Menagerie;
			item.colopts = { collection: val, regTick: true };
			item.thing = "ColBox";
		} else
			item.justkey = val.key || val;
		return item;
	},
	start: function(akey) {
		var zc = zero.core, zcar = zc.ar, qload = qs => zcar.load(zcar._.qs2aug(qs));
		if (akey)
			return akey.includes("=") ? qload(akey) : CT.db.one(akey, zcar.load);
		CT.modal.choice({
			prompt: "what do you want?",
			data: ["person", "video", "item", "flora", "fauna", "location", "anchors"],
			cb: function(arvar) {
				if (arvar == "person")
					zcar.loadPerson();
				else if (arvar == "video")
					zc.util.vidProg(v => qload("video=" + v), true);
				else if (arvar == "item")
					zcar.loadItem();
				else if (zcar.flofa(arvar))
					zcar.loadFlofa(arvar);
				else
					zcar.load(CT.module("templates.one.ar")[arvar]);
			}
		});
	}
};

CT.require("zero.core.ar.anchors");
CT.require("zero.core.ar.location");