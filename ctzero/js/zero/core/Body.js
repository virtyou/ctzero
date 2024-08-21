zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_yoff: true,
	obstructed: {},
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
	shove: function(direction, magnitude, multiplier, bobToo, prop) {
		var sz = this.springs, p2a = this.positioner2axis,
			amount = (magnitude || 1) * (multiplier || 1000), axis;
		prop = prop || "shove";
		for (axis of this._xyz)
			if (bobToo || (axis != "bob"))
				sz[axis][prop] = direction[p2a(axis)] * amount;
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
	holding: function(side, variety) {
		var item = this.held[side];
		return (item && variety) ? item[variety] : item;
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
		zero.core.util.onRoomReady(this.boundAndBob);
	},
	_rads: {},
	_bounds: {},
	radSwap: function(posture) {
		var rz = this._rads, bz = this._bounds, ob, w, w2, h,
			pz = this.group.position, vec = zero.core.util.vec;
		if (!rz.stand) {
			rz.stand = rz.sit = CT.merge(this.radii);
			ob = bz.stand = bz.sit = this.bounds;
			rz.lie = {
				x: rz.stand.x,
				y: rz.stand.z,
				z: rz.stand.y
			}
			bz.lie = new THREE.Box3(vec([ob.min.x, ob.min.z, ob.min.y]),
				vec([ob.max.x, ob.max.z, ob.max.y]));
			w = 10;
			h = 100;
			w2 = 2 * w
			rz.crouch = {
				x: rz.stand.x + w2,
				y: rz.stand.y - h,
				z: rz.stand.z + w2
			};
			bz.crouch = new THREE.Box3(vec([ob.min.x - w, ob.min.y, ob.min.z - w]),
				vec([ob.max.x + w, ob.max.y - h, ob.max.z + w]));
		}
		var isStand = posture == "stand",
			isCrouch = posture == "crouch";
		this._yoff = isStand || isCrouch;
		if (isStand)
			pz.y = pz.z = 0;
		else if (posture == "sit")
			pz.y = -2 * this._yoffset;
		else if (posture == "lie") {
			pz.z = -this._yoffset;
			pz.y = 20; // lol find a real fix
		}
		this.bounds = bz[posture];
		this.radii = rz[posture];
		this.setHomeY();
		this.setBob(true);
	},
	boundAndBob: function() {
		if (this.removed)
			return this.log("boundAndBob() aborting - already removed");
		this.basicBound(true);
		this.setBob(true);
	},
	equipper: function(g, held, bagger) { // if held or bagger, g is side.....
		var az = this.torso.arms, bz = this.bones, bm = this.bmap, xpos = 5,
			gmap = this.gearmap, gars = this.garments, gthing, propts = {},
			itemz = this.items, heldz = this.held, bagged = this.bagged;
		return function(gdata) {
			if (!("bone" in gdata)) {
				if (bagger) {
					propts.rotation = [-Math.PI * 7 / 8, 0, 0];
					propts.position = [(g == "left") ? xpos : -xpos, -20, -10];
					propts.bone = (bagger == "back") ? bm[g].arm.shoulder : bm[g].leg.hip;
				} else if (held)
					propts.bone = bm[g].arm.wrist; // ad-hoc held item
				else // side? sub? part?
					propts.bone = zero.core.util.gear2bone(gdata.kind);
			}
			if (!gdata.thing)
				gdata.thing = held ? "Item" : "Garment";
			gthing = gmap[gdata.key || gdata.fakeKey] = zero.core.util.thing(CT.merge(propts, gdata, {
				bones: bz,
				onbuild: held && az[g].hand.grasp,
				onremove: held && az[g].hand.release
			}));
			if (bagger)
				bagged[bagger][g] = gthing;
			else if (gdata.thing == "Garment")
				gars[gdata.name] = gthing;
			else if (gdata.thing == "Item")
				heldz[g] = itemz[gdata.name] = gthing;
		};
	},
	gear: function(gear, held, bagger) {
		var g, gval, k, n;
		for (g in gear) {
			gval = gear[g];
			if (gval) {
				if (typeof gval == "object")
					this.gear(gval, g == "held", bagger);
				else if (gval.startsWith("procedural.")) {
					[k, n] = gval.split(".").slice(1);
					this.equipper(g, held, bagger)(zero.base.clothes.procedurals(k, true, true)[n]);
				} else
					CT.db.one(gval, this.equipper(g, held, bagger), "json");
			}
		}
	},
	ungear: function(gkey, side, sub) { // sub? side where?
		var g, gt, k, kz = gkey ? [gkey] : Object.keys(this.gearmap);
		for (k of kz) {
			g = this.gearmap[k];
			gt = g.opts.thing;
			g.remove();
			if (gt == "Garment")
				delete this.garments[k];
			else if (gt == "Item") {
				delete this.items[g.name];
				delete this.held[side];
			}
			delete this.gearmap[k];
		}
	},
	bag: function(key, area, side) {
		var gopts = {};
		gopts[side] = key;
		this.gear(gopts, false, area);
	},
	unbag: function(area, side) {
		this.bagged[area][side].remove();
		delete this.bagged[area][side];
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
	setBob: function(rebob) {
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
		} else if (rebob || (obj && (obj.shelled || obj.vlower == "ramp" || obj.shifting("y")))) {
			otop = (obj || r).getTop(pos);
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
	curDance: function() {
		var within = this.within, dance = "walk";
		if (this.riding)
			dance = "ride";
		else if (this.flying)
			dance = "fly";
		else if (this.crawling)
			dance = "crawl";
		else if (this.climbing)
			dance = "climb";
		else if (within && within.opts.state == "liquid") {
			dance = "swim";
			(zero.core.util.ticker % 20) || this.bubbletrail.release(1);
		}
		return dance;
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	grow: function(scale, additive, rebound) {
		var bb = this.boundAndBob;
		if (typeof scale == "number")
			scale = [scale, scale, scale];
		this.springs.width.target = scale[0];
		this.springs.height.target = scale[1];
		this.springs.depth.target = scale[2]; // rebound overdoing it?
		rebound && setTimeout(bb, 500) && setTimeout(bb, 1000)
			&& setTimeout(bb, 2000) && setTimeout(bb, 4000);
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
		fznpak.onremove = CT.stream.util.stop;
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
			var zcc = zero.core.current, mount = this.riding, mp;
			if (mount)
				mount.saddleUp(pp);
			else {
				pp.x = pz.weave.value;
				pp.z = pz.slide.value;
				this.setBob();
			}
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
	wave: function(wname, segs, amp) {
		if (wname != "breath") // TODO: add more...
			return this.log(wname, "wave unimplemented");
		if (this.panting) {
			segs /= 2;
			amp *= 2;
		}
		return zero.core.trig.seg(segs, amp);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			castShadow: true,
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
		this.items = {};
		this.held = {};
		this.bagged = { back: {}, hip: {} };
		this._boundFixer = setTimeout(this.fixBounds, 5000);
	}
}, zero.core.Thing);