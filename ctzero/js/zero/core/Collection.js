zero.core.Collection = CT.Class({
	CLASSNAME: "zero.core.Collection",
	kinds: [],
	sets: {},
	spacing: 50,
	member: "Thing",
	_mem: function(kind, i, pos) {
		var mem = {
			thing: this.member,
			index: i,
			name: kind + i,
			kind: kind
		};
		if (pos)
			mem.position = pos;
		if (this.within)
			mem.within = this.within;
		this.members.push(mem.name);
		return mem;
	},
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
			pz.push(this._mem(kind, i, [x, 0, z]));
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
	boundone: function(mem) {
		mem.basicBound();
		mem.look(zero.core.util.randPos(true,
			mem.position(null, true).y, this.within));
	},
	boundize: function() {
		var kind, name, mem;
		for (kind of this.kinds) {
			for (name in this[kind]) {
				mem = this[kind][name];
				mem.onReady(() => this.boundone(mem));
			}
		}
		delete this.awaitBound;
	},
	randomize: function() {
		var kind, name, zcu = zero.core.util;
		for (kind of this.kinds) {
			for (name in this[kind]) {
				this[kind][name].update({
					position: zcu.randPos(true, null, this.within)
				});
			}
		}
	},
	random: function(kind) {
		var i, oz = this.opts, pz = oz.parts, mopts;
		for (i = 0; i < oz[kind]; i++) {
			mopts = this._mem(kind, i);
			if (!this.awaitBound) {
				mopts.position = zero.core.util.randPos(false, null, this.within);
				mopts.rotation = [0,
					CT.data.random(Math.PI * 2, true), 0];
			}
			pz.push(mopts);
		}
	},
	preassemble: function() {
		var oz = this.opts, r = this.within || zero.core.current.room;
		this.awaitBound = !(r.bounds || (oz.forceBound && r.getBounds()));
		if (oz.mode == "rows")
			this.kinds.forEach(this.row);
		else if (oz.mode == "cols")
			this.kinds.forEach(this.col);
		else {
			this.kinds.forEach(this.random);
			this.awaitBound && r.onbounded(this.randomize);
		}
		this.awaitBound && r.onbounded(this.boundize);
	},
	collect: function(collection) {
		if (!Array.isArray(collection)) {
			if (this.sets[collection])
				this.counts = this.sets[collection];
			this.kinds = Object.keys(this.counts);
			return this.counts;
		}
		this.kinds = collection;
		var col = this.counts = {}, kind, count = this.opts.count;
		for (kind of collection)
			col[kind] = count;
		return col;
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			mode: "random", // |rows|cols
			count: 1 // fallback count
		}, this.collect(opts.collection), this.opts);
		if (opts.within) {
			if (typeof opts.within == "string") {
				this.log("grabbing within...");
				this.within = (opts.withiner || zero.core.current.room)[opts.within];
				if (!this.within)
					this.log("CAN'T FIND WITHIN!");
			} else
				this.within = opts.within;
		}
		this.members = [];
	}
}, zero.core.Thing);