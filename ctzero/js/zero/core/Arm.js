zero.core.Arm = CT.Class({
	CLASSNAME: "zero.core.Arm",
	bmap: function() {
		return this.opts.bonemap.arm;
	},
	move: function(opts) {
		if (this.thrusting || this.swinging) return;
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
	thrust: function() {
		if (!this._thruster) {
			var isleft = this.opts.side == "left";
			this._thruster = {
				wrist: {x: 1},
				elbow: {x: 0},
				clavicle: {y: isleft && -0.5 || 0.5},
				shoulder: {x: -2, y: isleft && -0.5 || 0.5}
			};
		}
		this.setSprings(this._thruster);
		this.thrusting = true;
	},
	downthrust: function() {
		this.setSprings(this._downthruster);
		this.thrusting = true;
	},
	upthrust: function() {
		this.setSprings(this._upthruster);
		this.swinging = true;
	},
	unthrust: function() {
		this.setSprings(this._unthruster);
		this.swinging = this.thrusting = false;
	},
	poseRange: {
		position: {
			min: {
				x: 0, y: 0, z: 0
			},
			max: {
				x: 0, y: 0, z: 0
			}
		},
		rotation: {
			min: {
				x: 0, y: 0, z: 0
			},
			max: {
				x: 0, y: 0, z: 0
			}
		},
		sway: {},
		height: {},
		distance: {}
	},
	anaPose: function(target) {
		var asp, pr, coords, dim, v, side,
			prz = this.poseRange,
			sz = this.springs;
		for (asp in prz) {
			pr = prz[asp];
			coords = target.thring[asp];
			if (coords) {
				for (dim of this.dims) {
					v = coords[dim];
					pr.min[dim] = Math.min(v, pr.min[dim]);
					pr.max[dim] = Math.max(v, pr.max[dim]);
				}
				this.log(asp, "cur", coords.x, coords.y, coords.z);
				for (side in pr)
					this.log(asp, side, pr[side].x, pr[side].y, pr[side].z);
			} else {
				if (!("min" in pr))
					pr.min = pr.max = pr.cur;
				else {
					pr.min = Math.min(pr.cur, pr.min);
					pr.max = Math.max(pr.cur, pr.max);
				}
				this.log(asp, pr.cur, pr.min, pr.max);
			}
		}
		this.log(sz.shoulder_x.target, sz.elbow_x.target);
	},
	pose: function(target) {
		var r = target.thring.rotation,
			p = target.thring.position,
			prz = this.poseRange, ex,
			dep = p.z / 25,
			ver = -p.y / 25,
			d = prz.distance.cur = 0.5 - dep / 2,
			h = prz.height.cur = 2 * ver - 2,
			isRight = this.opts.side == "right",
			s = prz.sway.cur = p.x / 25 + (isRight ? 0.5 : -0.5),
			sz = this.springs;
		sz.clavicle_z.target = isRight ? ver : -ver;
		sz.clavicle_y.target = isRight ? dep : -dep;
		ex = sz.elbow_x.target = h * d;
		sz.shoulder_x.target = h - ex;
		sz.shoulder_z.target = s - sz.clavicle_y.target;
		sz.elbow_y.target = r.y;
		sz.wrist_x.target = -r.x;
		sz.wrist_z.target = -r.z;

//		this.anaPose(target); // <- logger
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