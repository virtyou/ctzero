zero.core.Shelf = CT.Class({
	CLASSNAME: "zero.core.Shelf",
	initPart: function(name, kind, geo, pos) {
		this.opts.parts.push({
			name: name,
			kind: kind,
			matinstance: this.material,
			boxGeometry: geo,
			position: pos
		});
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
	initSide: function(name, geo, pos) {
		this.initPart(name, "side", geo, pos);
	},
	initLevels: function(voff) {
		const oz = this.opts, pz = oz.parts, s = oz.spacing,
			w = oz.width, t = oz.thickness, d = oz.depth, ll = oz.legs.length;
		for (let i = 0; i < oz.levels; i++)
			this.initPart("level" + (i + 1), "level",
				[w, t, d], [0, ll + s * i - voff, 0]);
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
			back: false, // |true|tall
			sides: false,
			items: []
		}, this.opts);
	}
}, zero.core.Thing);