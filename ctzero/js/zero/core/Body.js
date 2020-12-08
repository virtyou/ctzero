zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_yoff: true,
	positioner2axis: function(pname) {
		return ["x", "y", "z"][this._xyz.indexOf(pname)];
	},
	assembled: function() {
		this.log("built body!");
		this.head.body = this;
		this.torso = new zero.core.Torso({
			body: this,
			bmap: this.bmap,
			bones: this.bones,
			onbuild: this._.built
		});
		this.spine = new zero.core.Spine({
			body: this,
			bones: this.bones,
			hbones: this.head.bones
		});
		this._.setPositioners();
		this._.setFlippers();
		this._.setGrowers();
		this._.setBounds();
	},
	setFriction: function(grippy, vertical) {
		var s = this.springs;
		s.slide.hard = s.weave.hard = s.orientation.hard = grippy;
		if (vertical) {
			s.bob.hard = grippy;
			s.bob.acceleration = grippy ? -1000 : 0;
		}
	},
	_lookers: {
		watcher: [0, 5, 15],
		looker: [0, 5, 15],
		lookAt: [0, 5, 45],
		lookHigh: [0, 10, 45]
	},
	_looker: function(name) {
		this.opts.parts.push({
			name: name,
			bone: 4,
			position: this._lookers[name],
			boxGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
	},
	preassemble: function() {
		Object.keys(this._lookers).forEach(this._looker);
		this.opts.parts.push({
			name: "bubbletrail",
			kind: "particles",
			thing: "Particles"
		});
	},
	_applyMod: function(gopts) {
		for (var op in gopts)
			for (var dim in gopts[op])
				this.springs[dim].target = gopts[op][dim];
	},
	move: function(ropts) {
		ropts.body && this._applyMod(ropts.body);
		this.torso.move(ropts);
		this.spine.move(ropts.spine);
	},
	resize: function(ropts) {
		ropts.body && this._applyMod(ropts.body);
		this.torso.resize(ropts);
		this.spine.resize(ropts.spine);
		setTimeout(this.setBounds, 1200, true);
	},
	equipper: function(g, held) { // if held, g is side.....
		var az = this.torso.arms, bz = this.bones,
			bm = this.bmap, gmap = this.gearmap;
		return function(gdata) {
			if (!("bone" in gdata)) // ad-hoc held item
				gdata.bone = bm[g].arm.wrist;
			gmap[gdata.key] = new zero.core.Thing(CT.merge(gdata, {
				bones: bz,
				onbuild: held && az[g].hand.grasp,
				onremove: held && az[g].hand.release
			}));
		};
	},
	gear: function(gear, held) {
		var g, gval;
		for (g in gear) {
			gval = gear[g];
			if (gval) {
				if (typeof gval == "object")
					this.gear(gval, g == "held");
				else
					CT.db.one(gval, this.equipper(g, held), "json");
			}
		}
	},
	ungear: function(gkey, side, sub) {
		var k, kz = gkey ? [gkey] : Object.keys(this.gearmap);
		for (k of kz) {
			this.gearmap[k].remove();
			delete this.gearmap[k];
		}
	},
	setBob: function() {
		var r = zero.core.current.room;
		if (!(r && r.isReady())) return;
		var pos = this.group.position,
			isRamp, otop, bobber = this.springs.bob,
			obj = r.getSurface(pos, this.radii);
		if (obj != this.upon) {
			this.log("upon", obj ? obj.name : "bottom");
			this.upon = obj;
			bobber.floored = false;
			this.setFriction((obj || r).grippy,
				!bobber.hard || (obj && obj.opts.state == "liquid"));
			for (var ps of ["weave", "bob", "slide"])
				this.springs[ps].pull = obj && obj.pull && obj.pull[ps];
			this._.bounder("y", 1, obj && obj.getTop(pos));
		} else if (obj) {
			isRamp = obj.vlower == "ramp";
			if (isRamp || obj.shifting("y")) {
				otop = obj.getTop(pos);
				if (isRamp) // eh.......
					bobber.floored = otop >= bobber.value - 100;
				this._.bounder("y", 1, otop, true);
			}
		}
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	_tickGroup: function() {
		for (var f in this.flippers)
			this.group.rotation[f] = this.flippers[f].value;
		this.group.rotation.y += this.springs.orientation.value;
		this.group.scale.x = this.growers.width.value;
		this.group.scale.y = this.growers.height.value;
		this.group.scale.z = this.growers.depth.value;
		var gp = this.group.position, pz = this.positioners;
		gp.y = pz.bob.value;
		this.moving = gp.x != pz.weave.value || gp.z != pz.slide.value;
		if (this.moving || (this.upon && this.upon.shifting("y"))) {
			gp.x = pz.weave.value;
			gp.z = pz.slide.value;
			this.setBob();
		}
	},
	tick: function(dts) {
		this.head.tick();
		this.torso.tick();
		this.spine.tick();
		this._tickGroup();
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
		this.bubbletrail.tick(dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			joints: zero.base.joints()
		});
		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		this.gearmap = {};
	}
}, zero.core.Thing);