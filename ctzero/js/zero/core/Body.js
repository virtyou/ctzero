zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_yoff: true,
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
		if (vertical) s.bob.hard = grippy;
	},
	preassemble: function() {
		this.opts.parts.push({
			name: "watcher",
			bone: 0,
			position: [0, 35, 25],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push({
			name: "looker",
			bone: 0,
			position: [0, 35, 25],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push({
			name: "lookAt",
			bone: 0,
			position: [0, 35, 55],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push({
			name: "lookHigh",
			bone: 0,
			position: [0, 45, 55],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
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
		var obj = zero.core.current.room.getObject(this.group.position);
		if (obj != this._upon) {
			this._upon = obj;
			this._.bounder("y", 1, obj && obj.getTop());
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
		this.group.position.y = this.positioners.bob.value;
		this.group.position.x = this.positioners.weave.value;
		this.group.position.z = this.positioners.slide.value;
	},
	tick: function() {
		this.head.tick();
		this.torso.tick();
		this.spine.tick();
		this._tickGroup();
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			joints: zero.base.joints()
		});
		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		this.gearmap = {};
	}
}, zero.core.Thing);