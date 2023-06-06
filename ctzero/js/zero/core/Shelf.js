zero.core.Shelf = CT.Class({
	CLASSNAME: "zero.core.Shelf",
	initPart: function(name, kind, geo, pos, parts) {
		const popts = {
			name: name,
			kind: kind,
			position: pos,
			boxGeometry: geo,
			matinstance: this.material
		};
		(parts || this.opts.parts).push(popts);
		return popts;
	},
	initLegs: function(girth, height, x, y, z) {
		for (let i = 0; i < 4; i++) {
			this.initPart("leg" + i, "leg", [girth, height, girth], [x, y, z]);
			if (i % 2)
				x *= -1;
			else
				z *= -1;
		}
	},
	initSide: function(name, geo, pos, parts) {
		return this.initPart(name, "side", geo, pos, parts);
	},
	initLevel: function(i, voff) {
		const oz = this.opts, w = oz.width, d = oz.depth, dz = oz.drawers,
			t = oz.thickness, s = oz.spacing, ll = oz.legs.length,
			popts = this.initPart("level" + (i + 1), "level",
				[w, t, d], [0, ll + s * i - voff, 0]);
		dz && dz > i && this.setDrawer(popts);
	},
	initLevels: function(voff) {
		for (let i = 0; i < this.opts.levels; i++)
			this.initLevel(i, voff);
	},
	setDrawer: function(popts) {
		var oz = this.opts, t = oz.thickness, outer;
		popts.parts = [];
		popts.isDrawer = true;
		this.drawers.push(popts.name);
		outer = this.initSide("outer", [oz.width, oz.spacing, t],
			[0, oz.spacing / 2, oz.depth / 2], popts.parts);
		outer.parts = [];
		this.initPart("handle", "attachment",
			[oz.width / 4, t, t], [0, 0, t], outer.parts);
	},
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, tx = oz.texture,
			w = oz.width, d = oz.depth, l = oz.legs,
			wh = w / 2, dh = d / 2, ll = l.length, lw = l.width,
			sheight = (oz.levels - ((oz.sides == "tall") ? 0 : 1)) * oz.spacing,
			bheight = (oz.back == "tall") ? (sheight + oz.spacing) : sheight,
			fheight = (oz.front == "tall") ? (sheight + oz.spacing) : sheight,
			lfl = l.full ? (ll + sheight) : ll, llh = lfl / 2,
			fullheight = bheight + ll, voff = fullheight / 2,
			legy = llh - voff,
			backy = ll + bheight / 2 - voff,
			fronty = ll + fheight / 2 - voff,
			sidey = ll + sheight / 2 - voff;
		this.material = this.getMaterial();
		this.drawers = [];
		this.initLegs(lw, lfl, wh, legy, dh);
		oz.back && this.initSide("back", [w, bheight, 2], [0, backy, -dh]);
		oz.front && this.initSide("front", [w, fheight, 2], [0, fronty, dh]);
		if (oz.sides) {
			this.initSide("left", [2, sheight, d], [-wh, sidey, 0]);
			this.initSide("right", [2, sheight, d], [wh, sidey, 0]);
		}
		this.initLevels(voff);
		pz.push({
			name: "looker",
			position: [0, 50, 100]
		});
	},
	postassemble: function() {
		this.opts.items.forEach(this.placeItem);
	},
	openable: function() {
		return !!(this.drawers.length || this.lid);
	},
	opener: function() {
		const options = this.drawers.slice();
		this.lid && options.unshift("lid");
		if (!options.length)
			return this.log("nothing to open!");
		if (options.length == 1)
			return this.open(options.pop());
		CT.moda.choice({
			prompt: "want to open this " + this.opts.variety + "?",
			data: options,
			cb: this.open
		});
	},
	open: function(compartment) {
		compartment = this.getCompartment(compartment);
		if (!compartment || compartment._opened) return this.log("nothing to open!");
		compartment._opened = true;
		if (compartment.opts.isDrawer)
			compartment.adjust("position", "z", this.opts.depth, true);
		else { // lid

		}
	},
	close: function(compartment) {
		compartment = this.getCompartment(compartment);
		if (!compartment || !compartment._opened) return this.log("nothing to close!");
		compartment._opened = false;
		if (compartment.opts.isDrawer)
			compartment.adjust("position", "z", -this.opts.depth, true);
		else { // lid

		}
	},
	getCompartment: function(compartment) {
		return this[compartment] || this.lid || (this.drawers[0] && this[this.drawers[0]]);
	},
	placeItem: function(item, i) {
		const oz = this.opts;
		if (typeof i != "number") {
			i = oz.items.length;
			oz.items.push(item);
		}
		if (!item.position) {
			const w = oz.width - 10, // TODO: configurize?
				pos = i * 9, x = (pos % w) - w / 2,
				lev = oz.levels - Math.floor(pos / w),
				y = this["level" + lev].position().y + 8; // assume book....
			item.position = [x, y, 0];
		}
		this.attach(item);
	},
	removeItem: function(item) {
		CT.data.remove(this.opts.items, item);
		this.detach(item.name);
	},
	peruse: function() {
		this.closeup();
		CT.modal.choice({
			prompt: "want to read a book?",
			data: Object.keys(this.book),
			cb: bookname => zero.core.current.person.touch(this[bookname],
				this[bookname].read, null, this)
		});
	},
	perusebutt: function() {
		return CT.dom.button("peruse", this.peruse);
	},
	closeup: function() {
		var cam = zero.core.camera;
		cam.perspective();
		cam.follow(this);
		cam.move(this.looker.position(null, true));
	},
	init: function(opts) {
		const bs = zero.base.carpentry[opts.variety];
		opts.legs = CT.merge(this.opts.legs, bs.legs, {
			width: 4,
			length: 40,
			full: true
		});
		this.opts = opts = CT.merge(opts, bs, {
			levels: 1,
			width: 40,
			depth: 40,
			spacing: 20,
			thickness: 4,
			sides: false, // |true|tall
			front: false, // |true|tall
			back: false,  // |true|tall
			items: []
		}, this.opts);
	}
}, zero.core.Thing);