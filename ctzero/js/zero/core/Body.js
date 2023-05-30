zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_yoff: true,
	positioner2axis: function(pname) {
		return zero.core.util.xyz[this._xyz.indexOf(pname)];
	},
	axis2positioner: function(axis) {
		return this._xyz[zero.core.util.xyz.indexOf(axis)];
	},
	wbs: function() {
		var wbs = {}, springz = this.springs;
		this._xyz.forEach(function(dim, i) {
			wbs[dim] = springz[dim].target;
		});
		return wbs;
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
		this.grippy = s.slide.hard = s.weave.hard = s.orientation.hard = grippy;
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
		lookHigh: [0, 10, 60],
		polar: [0, 40, 0]
	},
	_lcolors: {
		watcher: 0xff0000,
		looker: 0x0000ff
	},
	_looker: function(name) {
		var lopts = {
			name: name,
			position: this._lookers[name],
			boxGeometry: [1, 1, 5],
			material: {
			    color: this._lcolors[name] || 0x00ff00,
			    visible: core.config.ctzero.helpers
			}
		};
		if (name == "polar") {
			lopts.anchor = this.getPlacer();
			lopts.parts = [{
				name: "tilter",
				parts: [{
					name: "watcher",
					position: [0, 0, 150],
					boxGeometry: [1, 1, 5],
					material: {
					    color: 0x00ff00,
					    visible: core.config.ctzero.helpers
					}
				}]
			}, {
				name: "directors",
				rotation: [0, Math.PI, 0],
				parts: zero.core.util.directorize()
			}];
		} else
			lopts.bone = 4;
		this.opts.parts.push(lopts);
	},
	preassemble: function() {
		var pz = zero.core.util.directorize(this.opts.parts);
		Object.keys(this._lookers).forEach(this._looker);
		pz.push({
			name: "gotar",
			anchor: camera.scene
		});
		pz.push({
			name: "bubbletrail",
			kind: "particles",
			thing: "Particles"
		});
		pz.push({
			name: "splash",
			kind: "particles",
			thing: "Particles",
			position: [0, -100, 0]
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
	adjust: function(property, dimension, value, additive, thring) {
		if (property == "position") {
			var s = this.springs[this.axis2positioner(dimension)];
			if (additive)
				s.target += value;
			else
				s.target = value;
			s.value = s.target;
		} else if (additive)
			(thring || this.placer)[property][dimension] += value;
		else
			(thring || this.placer)[property][dimension] = value;
	},
	_thruster: {lumbar: {x: 0.2}, ribs: {x: 0.5}, neck: {x: -2}},
	_unthruster: {lumbar: {x: 0}, ribs: {x: 0}, neck: {x: 0}},
	thrust: function(side) {
		this.torso.arms[side].thrust();
		this.spine.setSprings(this._thruster);
	},
	unthrust: function(side) {
		this.torso.arms[side].unthrust();
		this.spine.setSprings(this._unthruster);
	},
	move: function(ropts) {
		ropts.body && this._applyMod(ropts.body);
		this.torso.move(ropts);
		this.spine.move(ropts.spine);
		this._moving = true;
	},
	resize: function(ropts) {
		ropts.body && this._applyMod(ropts.body);
		this.torso.resize(ropts);
		this.spine.resize(ropts.spine);
		setTimeout(this.setBounds, 1200, true);
	},
	equipper: function(g, held) { // if held, g is side.....
		var az = this.torso.arms, bz = this.bones,
			bm = this.bmap, gmap = this.gearmap, gars = this.garments;
		return function(gdata) {
			if (!("bone" in gdata)) {
				if (held)
					gdata.bone = bm[g].arm.wrist; // ad-hoc held item
				else // side? sub? part?
					gdata.bone = zero.core.util.gear2bone(gdata.kind);
			}
			gmap[gdata.key] = zero.core.util.thing(CT.merge(gdata, {
				bones: bz,
				onbuild: held && az[g].hand.grasp,
				onremove: held && az[g].hand.release
			}));
			if (gdata.thing == "Garment")
				gars[gdata.name] = gmap[gdata.key];
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
			if (this.gearmap[k].opts.thing == "Garment")
				delete this.garments[k];
			delete this.gearmap[k];
		}
	},
	fixBounds: function() {
		var gars = Object.values(this.garments);
		if (!gars.length) return;
		if (this._moving == false) { // neither true nor undefined
			this._boundFixer = setTimeout(this.fixBounds, 2000);
			return;
		}
		this._moving = false;
		var g, p = this.position(null, true);
		for (g of gars)
			g.fixBounds(p);
		this._boundFixer = setTimeout(this.fixBounds, 300);
	},
	onremove: function() {
		clearTimeout(this._boundFixer);
		this.ungear(); // anything else???
	},
	setBob: function() {
		var r = zero.core.current.room;
		if (!(r && r.isReady())) return;
		var pos = this.placer.position,
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
	fznpak: function() {
		var g, gz = this.gearmap;
		if (gz.fznstreamer)
			return gz.fznstreamer;
		for (g in gz)
			if (gz[g].name == "fznpak")
				return gz[g];
		this.equipper("neck")({
			bone: 3,
			name: "fznpak",
			thing: "Garment",
			kind: "worn_neck",
			key: "fznstreamer",
			template: "zero.base.clothes.neck.fznpak"
		});
		return gz.fznstreamer;
	},
	streamify: function(chan, streamup) {
		if (chan == this.fznchan) return;
		if (!chan) return this.unstreamify();
		var fznpak = this.fznpak(), fo = fznpak.opts, pref = "fzn:";
		if (streamup)
			pref += "up:";
		fznpak.onReady(function() {
			fznpak[fo.fzreen].update({
				video: pref + chan
			});
		});
		this.fznchan = chan;
	},
	unstreamify: function() {
		if (this.gearmap.fznstreamer)
			this.ungear("fznstreamer");
		delete this.fznchan;
	},
	getGroup: function() {
		if (!this.group) {
			this.group = new THREE.Object3D();
			this.getPlacer().add(this.group);
		}
		return this.group;
	},
	outerGroup: function() {
		return this.getPlacer();
	},
	_tickGroup: function() {
		for (var f in this.flippers)
			this.group.rotation[f] = this.flippers[f].value;
		this.group.rotation.y += this.springs.orientation.value;
		this.group.scale.x = this.growers.width.value;
		this.group.scale.y = this.growers.height.value;
		this.group.scale.z = this.growers.depth.value;
		var pp = this.placer.position, pz = this.positioners;
		pp.y = pz.bob.value;
		this.moving = pp.x != pz.weave.value || pp.z != pz.slide.value;
		if (this.moving || (this.upon && this.upon.shifting("y"))) {
			pp.x = pz.weave.value;
			pp.z = pz.slide.value;
			this.setBob();
			var zcc = zero.core.current;
			(this.person == zcc.person) && zero.core.util.roomReady() && zcc.room.setVolumes();
		}
	},
	_tickPolar: function() {
		if (zero.core.camera.current != "polar")
			return;
		var sz = this.springs, pr = this.polar.group.rotation,
			tr = this.polar.tilter.group.rotation;
		tr.x = sz.theta.value;
		pr.y = sz.phi.value;
	},
	tick: function(dts) {
		this.head.tick();
		this.torso.tick();
		this.spine.tick();
		this._tickGroup();
		this._tickPolar();
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
		this.bubbletrail.tick(dts);
		this.splash.tick(dts);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			joints: zero.base.joints()
		});
		var mat = opts.material;
		if (mat && mat.opacity && !mat.alphaTest) {
			this.log("setting alphaTest to opacity " + mat.opacity);
			mat.alphaTest = mat.opacity;
		}
//		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		this.gearmap = {};
		this.garments = {};
		this._boundFixer = setTimeout(this.fixBounds, 5000);
	}
}, zero.core.Thing);