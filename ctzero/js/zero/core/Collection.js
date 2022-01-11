zero.core.Collection = CT.Class({
	CLASSNAME: "zero.core.Collection",
	kinds: [],
	spacing: 50,
	member: "Thing",
	_rower: function(kind, strip, isrow) {
		var i, oz = this.opts, pz = oz.parts,
			spacing = this.spacing, width = oz[kind] * spacing,
			a = -width / 2, b = strip * spacing;
		if (isrow) {
			x = a;
			z = b;
		} else {
			z = a;
			x = b;
		}
		for (i = 0; i < oz[kind]; i++) {
			pz.push({
				thing: this.member,
				index: i,
				name: kind + i,
				kind: kind,
				position: [x, 0, z]
			});
			if (isrow)
				x += spacing;
			else
				z += spacing;
		}
	},
	row: function(kind, index) {
		this._rower(kind, index, true);
	},
	col: function(kind, index) {
		this._rower(kind, index);
	},
	randomize: function() {
		var kind, name, mem, zcu = zero.core.util;
		for (kind of this.kinds) {
			for (name in this[kind]) {
				mem = this[kind][name];
				mem.update({
					position: zcu.randPos(true)
				});
				mem.look(zcu.randPos(true));
			}
		}
	},
	random: function(kind) {
		var i, oz = this.opts, pz = oz.parts, mopts,
			r = zero.core.current.room, deferRand = !r.bounds;
		for (i = 0; i < oz[kind]; i++) {
			mopts = {
				thing: this.member,
				index: i,
				name: kind + i,
				kind: kind
			};
			if (!deferRand) {
				mopts.position = zero.core.util.randPos();
				mopts.rotation = [0,
					CT.data.random(Math.PI * 2, true), 0];
			}
			pz.push(mopts);
		}
		deferRand && r.onbounded(this.randomize);
	},
	preassemble: function() {
		if (this.opts.mode == "rows")
			this.kinds.forEach(this.row);
		else if (this.opts.mode == "cols")
			this.kinds.forEach(this.col);
		else
			this.kinds.forEach(this.random);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			mode: "random", // |rows|cols
		}, this.counts, this.opts);
	}
}, zero.core.Thing);