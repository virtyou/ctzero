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
		core.config.ctzero.gravity && setTimeout(this.setBob);
	},
	setFriction: function(grippy, vertical) {
		var s = this.springs;
		s.slide.hard = s.weave.hard = s.orientation.hard = grippy;
		if (vertical) {
			s.bob.hard = grippy;
			s.bob.acceleration = grippy ? -1000 : 0;
		}
		if (core.config.ctzero.camera.vr && this.person == zero.core.current.person) {
			if (!s.shake.hard) {
				s.shake.hard = s.nod.hard = true; // gives control to headset
				this.tickers.shake.stop();
				this.tickers.nod.stop();
			}
		}
	},
	_lookers: {
		watcher: [0, 5, 15],
		looker: [0, 5, 15],
		lookAt: [0, 5, 60],
		lookHigh: [0, 10, 60]
	},
	_lcolors: {
		watcher: 0xff0000,
		looker: 0x0000ff
	},
	_looker: function(name) {
		this.opts.parts.push({
			name: name,
			bone: 4,
			position: this._lookers[name],
			boxGeometry: [1, 1, 5],
			material: {
			    color: this._lcolors[name] || 0x00ff00,
			    visible: core.config.ctzero.helpers
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
	boundOnRoom: function() {
		var zcc = zero.core.current;
		if (zcc.room && zcc.room.bounds)
			this.setBounds();
		else
			setTimeout(this.boundOnRoom, 500);
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
			if (!("bone" in gdata)) {
				if (held)
					gdata.bone = bm[g].arm.wrist; // ad-hoc held item
				else // side? sub? part?
					gdata.bone = zero.core.util.gear2bone(gdata.kind);
			}
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
			otop, bobber = this.springs.bob,
			obj = r.getSurface(pos, this.radii),
			within = r.within(pos, this.radii, true),
			changed, wet = within && within.opts.state == "liquid";
		if (within != this.within) {
			this.log("within", within ? within.name : "nothing");
			changed = true;
			var toLiq = within && within.opts.state == "liquid",
				fromLiq = this.within && this.within.opts.state == "liquid";
			if (toLiq || fromLiq) {
				this.person.sfx("splash");
				toLiq && within.ambience("within");
				fromLiq && this.within.ambience("without");
			}
			this.within = within;
		}
		if (obj != this.upon) {
			this.log("upon", obj ? obj.name : "bottom");
			changed = true;
			this.upon = obj;
			bobber.floored = false;
			for (var ps of ["weave", "bob", "slide"])
				this.springs[ps].pull = obj && obj.pull && obj.pull[ps];
			this._.bounder("y", 1, obj && obj.getTop(pos));
		} else if (obj && (obj.shelled || obj.vlower == "ramp" || obj.shifting("y"))) {
			otop = obj.getTop(pos);
			bobber.floored = otop >= bobber.value - 100;
			this._.bounder("y", 1, otop, true);
		}
		if (this.landing) {
			changed = true;
			this.flying = this.landing = false;
		}
		changed && this.setFriction(this.person.grippy && !wet && !this.flying && (obj || r).grippy,
			this.flying || wet || !bobber.hard);
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	grow: function(scale, additive) {
		if (typeof scale == "number")
			scale = [scale, scale, scale];
		this.springs.width.target = scale[0];
		this.springs.height.target = scale[1];
		this.springs.depth.target = scale[2];
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
			var zcc = zero.core.current;
			(this.person == zcc.person) && zcc.room.setVolumes();
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