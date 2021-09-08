zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	bmap: function() {
		return this.opts.bonemap.arm;
	},
	move: function(opts) {
		this.setSprings(opts.arm);
		this.hand.move(opts.hand);
	},
	resize: function(opts) {
		this.setScales(opts.arm);
		this.hand.resize(opts.hand);
	},
	setScales: function(opts) {
		var part, thaz = this, bm = this.opts.bonemap.arm;
		for (part in opts) {
			zero.core.util.coords(opts[part], function(dim, val) {
				thaz[part].scale[dim] = val;
				if (part == "clavicle")
					thaz.body.head.bones[bm.clavicle].scale[dim] = val;
			});
		}
	},
	tickPart: function(part) {
		var rz = this.rotation(part);
		zero.core.util.update(rz, this[part].rotation);
		(part == "clavicle") && zero.core.util.update(rz,
			this.body.head.bones[this.opts.bonemap.arm.clavicle].rotation);
	},
	tick: function() {
		zero.core[this.variety].parts.forEach(this.tickPart);
		this.hand.tick();
	},
	unspring: function() {
		var a, asp;
		for (asp in this.aspects) {
			a = this.aspects[asp];
			a.bsprings = {};
			a.hsprings = {};
			a.springs = {};
			a.springs[asp] = 1;
		}
	},
	pose: function(target) {      // TODO!!!!!
		var r = target.rotation(),
			p = target.position();
//		this.orient("shoulder", "z", r.z);
//		this.orient("shoulder", "x", r.x);
//		for (var d in this.dims) {

//		}
//		this.orient("wrist", "x", );

//		this.point("shoulder", target);
//		this.point("elbow", target);
//		this.point("wrist", target);
	},
	setBody: function(bod) {
		this.body = bod;
		this.hand && this.hand.setBody(bod);
		for (var p in zero.base.tickers.arm) {
			var sname = "gesticulate_" + p;
			this.springs[sname] = zero.core.springController.add(zero.base.springs.arm[p], sname, this);
			this.tickers[sname] = zero.core.tickerController.add(zero.base.tickers.arm[p],
				sname, this, this.body);
		}
	},
	build: function() {
		var oz = this.opts, bones = oz.bones, bmap = oz.bonemap;
		this.setJoints();
		this.hand = new zero.core.Hand({
			parent: this,
			bones: bones,
			body: this.body,
			bonemap: bmap.hand,
			side: this.opts.side
		});
	}
}, zero.core.Skeleton);
zero.core.Arm.parts = ["clavicle", "shoulder", "elbow", "wrist"];