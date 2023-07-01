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
		var upnat = function(natset) {
			natset && r.attach(nat.setter(variety, area, natset));
			CT.dom.setContent(sel, natset);
			omap[area] = natset;
			onup(sname);
		}, sel = CT.dom.link(omap[area] || "none", function() {
			nat.group(variety, function(natset) {
				if (r[mname])
					r.detach(mname);
				if (natset == "custom") {
					CT.modal.choice({
						style: "multiple-choice",
						data: base.kinds,
						cb: upnat
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
		var omap, zc = zero.core, nat = zc.natural,
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
		return sopts;
	}
};