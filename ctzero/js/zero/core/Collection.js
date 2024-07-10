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
		this.log("boundone()", mem.name);
		mem.basicBound();
		mem.look(zero.core.util.randPos(true, mem.homeY, this.within));
		(this.opts.mode == "random") && this.randone(mem);
	},
	boundsoon: function(mem) {
		mem.onReady(() => this.boundone(mem));
	},
	boundize: function() {
		this.log("boundize()");
		var kind, name;
		for (kind of this.kinds)
			for (name in this[kind])
				this.boundsoon(this[kind][name]);
	},
	randone: function(mem) {
		mem.update({
			position: zero.core.util.randPos(true, mem.homeY, this.within)
		});
	},
	randomize: function() {
		this.log("randomize()");
		var kind, name, zcu = zero.core.util;
		for (kind of this.kinds)
			for (name in this[kind])
				this.randone(this[kind][name]);
	},
	random: function(kind) {
		var i, oz = this.opts, pz = oz.parts, mopts,
			hasBounds = (this.within || zero.core.current.room).bounds;
		for (i = 0; i < oz[kind]; i++) {
			mopts = this._mem(kind, i);
			if (hasBounds) {
				mopts.position = zero.core.util.randPos(false, null, this.within);
				mopts.rotation = [0,
					CT.data.random(Math.PI * 2, true), 0];
			}
			pz.push(mopts);
		}
	},
	preassemble: function() {
		var oz = this.opts;
		if (oz.mode == "rows")
			this.kinds.forEach(this.row);
		else if (oz.mode == "cols")
			this.kinds.forEach(this.col);
		else
			this.kinds.forEach(this.random);
		(this.within || zero.core.current.room).onbounded(this.boundize);
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