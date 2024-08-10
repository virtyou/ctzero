zero.core.natural = {
	editors: function(variety, opts, onup) {
		var zc = zero.core, nat = zc.natural,
			omap = nat.omap(variety, opts),
			ed = area => nat.editor(variety, area, opts, onup),
			eds = CT.dom.div(Object.keys(omap).map(ed));
		return CT.dom.div([
			CT.dom.button("add", function() {
				zc.util.getArea(area => eds.appendChild(ed(area)), omap);
			}, "right"),
			CT.dom.div(variety, "big bold"),
			eds
		], "bordered padded margined round");
	},
	editor: function(variety, area, opts, onup) {
		var zc = zero.core, nat = zc.natural, cz = nat.classes(variety),
			r = zc.current.room, omap = nat.omap(variety, opts),
			base = cz.base, setter = cz.setter,
			sname = base.setter, mname = area + "_" + sname;
		var label = function(natset) {
			return (natset && natset.count) ? [
				CT.dom.div("x" + natset.count, "right yellow"),
				natset.collection
			] : natset;
		}, upnat = function(natset) {
			natset && r.attach(nat.setter(variety, area, natset));
			CT.dom.setContent(sel, label(natset));
			omap[area] = natset;
			onup(sname);
		}, sel = CT.dom.link(label(omap[area]) || "none", function() {
			nat.group(variety, function(natset) {
				if (r[mname])
					r.detach(mname);
				if (natset == "custom") {
					CT.modal.choice({
						style: "multiple-choice",
						data: base.kinds,
						cb: function(collection) {
							CT.modal.prompt({
								prompt: "how many of each creature?",
								style: "number",
								min: 1,
								max: 10,
								step: 1,
								initial: 2,
								classname: "w200p",
								cb: function(num) {
									upnat({
										count: num,
										collection: collection
									});
								}
							});
						}
					});
				} else
					upnat((natset != "none") ? natset : null);
			});
		});
		return CT.dom.div([
			CT.dom.span(area + ":"),
			CT.dom.pad(),
			sel
		], "bordered padded margined round");
	},
	group: function(variety, cb) {
		var vsets = Object.keys(zero.core.natural.classes(variety).base.sets);
		CT.modal.choice({
			prompt: "please select a " + variety + " set",
			data: ["none", "custom"].concat(vsets),
			cb: cb
		});
	},
	classes: function(variety) {
		var cap = CT.parse.capitalize, base = zero.core[cap(variety)];
		return {
			base: base,
			setter: base[cap(base.setter)]
		};
	},
	omap: function(variety, opts) {
		var k, omap, zc = zero.core, nat = zc.natural,
			sname = nat.classes(variety).base.setter;
		opts = opts || zc.current.room.opts;
		omap = opts[sname];
		if (!omap)
			omap = opts[sname] = {};
		else if (typeof omap == "string" || Array.isArray(omap)) {
			CT.log("changing " + variety + " from " + omap + " to object");
			omap = opts[sname] = {
				room: omap
			};
		}
		for (k of Object.keys(omap))
			if (!omap[k])
				delete omap[k];
		return omap;
	},
	setter: function(variety, area, collection) {
		var cz = zero.core.natural.classes(variety), sname = cz.base.setter, sopts = {
			name: area + "_" + sname,
			kind: sname,
			collection: collection,
			subclass: cz.setter
		};
		if (area != "room")
			sopts.within = area;
		if (collection.count) {
			sopts.count = collection.count;
			sopts.collection = collection.collection;
		}
		return sopts;
	}
};