zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	_assembled: {
		lights: 0,
		objects: 0
	},
	_tickers: [],
	_electrical: ["panel", "bulb", "gate", "elevator", "computer"],
	_structural: ["obstacle", "floor", "wall", "ramp", "stairs", "boulder", "stala"],
	_surfaces: ["obstacle", "floor", "ramp", "stairs", "boulder", "stala", "elevator"],
	_bumpers: ["wall", "obstacle", "boulder", "stala", "gate"],
	_wallers: ["ramp", "elevator"],
	_wallerers: ["wall", "gate"],
	_interactives: {
		brittle: ["boulder", "stala"],
		frozen: ["boulder", "stala"],
		flammable: ["wall"]
	},
	_moshAxes: ["slide", "weave"],
	removables: function() {
		return this.parts.concat(this.objects);
	},
	tick: function(dts, rdts) {
		var obj;
		for (obj of this.objects)
			obj.tick && obj.tick(dts, rdts);
		for (obj of this._tickers)
			obj.tick(dts, rdts);
		if (this.particles)
			for (obj in this.particles)
				this.particles[obj].tick(dts, rdts);
		if (this.swarm)
			for (obj in this.swarm)
				this.swarm[obj].tick();
		this.perMenagerie(men => men.tick(dts));
		this.jostle();
	},
	perMenagerie: function(cb) {
		if (this.menagerie)
			for (men in this.menagerie)
				cb(this.menagerie[men]);
	},
	getMounts: function() {
		var mounts = [];
		this.perMenagerie(function(men) {
			mounts = mounts.concat(men.mounts());
		});
		return mounts;
	},
	getMount: function(name) {
		for (var mount of this.getMounts())
			if (!name || mount.name == name)
				return mount;
	},
	bump: function(b1, b2, moshy) {
		var axis, s1, s2, v1, v2, vd, axes = this._moshAxes;
		moshy = moshy || this.moshiness(b1) || 20;
		zero.core.current.person.sfx("thud");
		for (axis of axes) {
			s1 = b1.springs[axis];
			s2 = b2.springs[axis];
			v1 = s1.velocity || s1.boost;
			v2 = s2.velocity || s2.boost;
			vd = v2 - v1;
			s1.shove = vd * moshy;
			s2.shove = -vd * moshy;
		}
	},
	moshiness: function(b) {
		return b.upon && b.upon.opts.moshy || this.opts.moshy;
	},
	jostle: function() {
		var zcc = zero.core.current, pz = zcc.people, you = zcc.person,
			b = you && you.body, rz = b && b.radii, pname, pbod, moshy;
		if (!b) return;// this.log("jostle() aborting - no body");
		moshy = this.moshiness(b);
		if (!moshy) return;
		var pos = b.position();
		for (pname in pz) {
			pbod = pz[pname].body;
			if ((pname == you.name) || (pbod.upon != b.upon)) continue;
			pbod.bounds.setFromObject(pbod.group);
			pbod.overlaps(pos, rz, true) && this.bump(b, pbod, moshy);
		}
	},
	regTicker: function(ticker) {
		this._tickers.push(ticker);
	},
	unregTicker: function(ticker) {
		CT.data.remove(this._tickers, ticker);
	},
	eject: function(person, port, remove) {
		var bod = person.body, wall = port && port.opts.wall,
			sz = bod.springs, pz = bod.positioners, dist = 500; // revise
		person.body.setFriction(false, true);
		person.unride();
		if (wall == 0) {
			delete sz.slide.bounds;
			sz.slide.target -= dist;
			pz.slide.min -= dist;
		} else if (wall == 1) {
			delete sz.weave.bounds;
			sz.weave.target += dist;
			pz.weave.max += dist;
		} else if (wall == 2) {
			delete sz.slide.bounds;
			sz.slide.target += dist;
			pz.slide.max += dist;
		} else if (wall == 3) {
			delete sz.weave.bounds;
			sz.weave.target -= dist;
			pz.weave.min -= dist;
		} else {
			delete sz.bob.bounds;
			sz.bob.target -= dist;
			pz.bob.min -= dist;
		}
		setTimeout(remove ? person.remove : bod.hide, 500);
	},
	inject: function(person, port) {
		var bod = person.body, wall, prop = "bob",
			sz = bod.springs, amount = -50; // revise -> should be axis diameter
		bod.setFriction(false, true);
		if (port) {
			wall = port.opts.wall;
			prop = this._moshAxes[wall % 2];
			if (wall == 1 || wall == 2)
				amount *= -1;
			person.body.setPositioners(port.position(), false, true);
		}
		sz[prop].ebound = false;
		sz[prop].value += amount;
		sz[prop].target += amount;
		delete sz[prop].bounds;
		bod.positioners[prop].unbounded = true;
		bod.show();
		setTimeout(function() {
			sz[prop].target -= 2 * amount;
		}, 500);
		setTimeout(function() {
			sz[prop].ebound = true;
			bod.bindAxis(prop);
			bod.setFriction(true, true);
			bod.setBounds();
		}, 2000);
	},
	dynFloor: function(pos) {
		var zcu = zero.core.util;
		zcu.ray.set(pos, zcu.downVec);
		var isec = zcu.ray.intersectObject(this.thring)[0];
		return isec && isec.point.y;
	},
	getTop: function(pos) {
		return this.shelled ? this.dynFloor(pos) : this.bounds.min.y + 1;
	},
	within: function(pos, radii, checkY, kind, prop) {
		kind = kind || "elemental";
		prop = prop || "kind";
		for (var i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			if (obj.opts[prop] == kind && obj.overlaps(pos, radii, checkY))
				return obj;
		}
	},
	getFires: function(quenched, lit) {
		var fires = this.objects.filter(item => item.opts.state == "plasma");
		if (quenched)
			fires = fires.filter(item => item.quenched);
		else if (lit)
			fires = fires.filter(item => !item.quenched);
		return fires;
	},
	getFire: function(pos, quenched, lit) {
		var fires = this.getFires(quenched, lit);
		return pos ? zero.core.util.closest(pos, fires) : fires[0];
	},
	getFeaturing: function(feature) {
		var k, t, item, featurings = [];
		for (k of this._interactives[feature]) {
			for (t in this[k]) {
				item = this[k][t];
				if (item.opts[feature])
					featurings.push(item);
			}
		}
		return featurings;
	},
	getPerson: function(thing, allowed) {
		var name, person, zc = zero.core,
			peeps = zc.current.people, touching = zc.util.touching;
		for (name in peeps) {
			if (allowed && !allowed[name] && (name != allowed))
				continue;
			person = peeps[name];
			if (touching(thing, person.body, 50, false, true))
				return person;
		}
	},
	getPanel: function(overlapper) {
		return this.getKind("panel", overlapper);
	},
	getGate: function(overlapper) {
		return this.getKind("gate", overlapper);
	},
	getComputer: function(overlapper) {
		return this.getKind("computer", overlapper);
	},
	getInteractive: function(overlapper, feature) {
		var item, touching = zero.core.util.touching;
		for (item of this.getFeaturing(feature))
			if (touching(overlapper, item, 50, false, true))
				return item;
	},
	getBrittle: function(overlapper) {
		return this.getInteractive(overlapper, "brittle");
	},
	getFrozen: function(overlapper) {
		return this.getInteractive(overlapper, "frozen");
	},
	getFlammable: function(overlapper) {
		return this.getInteractive(overlapper, "flammable");
	},
	getObject: function(pos, radii, checkY, kind, prop) {
		var k, w, o, obst, wobst;
		for (k of this._bumpers) {
			for (o in this[k]) {
				obst = this[k][o];
				if (obst.overlaps(pos, radii, checkY))
					return obst;
			}
		}
		for (k of this._wallers) {
			if (this[k]) {
				for (o in this[k]) {
					obst = this[o];
					for (w of this._wallerers) {
						if (obst[w]) {
							for (k in obst[w]) {
								wobst = obst[k];
								if (wobst.isReady() && wobst.overlaps(pos, radii, checkY))
									return wobst;
							}
						}
					}
				}
			}
		}
		return this.within(pos, radii, checkY, kind, prop);
	},
	getSolid: function(pos, radii, checkY, objectsOnly) {
		return this[objectsOnly ? "within" : "getObject"](pos, radii, checkY, "solid", "state");
	},
	surfaces: function(nameOnly) {
		var k, n, sz = [];
		for (k of this._surfaces) {
			if (this[k]) {
				for (n in this[k])
					sz.push(nameOnly ? n : this[n]);
			}
		}
		return sz;
	},
	getSurface: function(pos, radii, topmost) {
		var val, top, winner, test = function(obj) {
			if (obj) {
				val = obj.getTop(pos);
				if (topmost || val <= pos.y) {
					if (!top || val > top) {
						top = val;
						winner = obj;
					}
				}
			}
		}, flo, surfaces = this.surfaces();
		test(this.getSolid(pos, radii, false, true));
		for (flo of surfaces)
			flo.overlaps(pos, radii) && test(flo);
		this.shelled && test(this);
		return winner;
	},
	getPeak: function(pos, radii, topmost) {
		return (this.getSurface(pos, radii, topmost) || this).getTop(pos);
	},
	ebound: function(spr, bod) {
		if (!bod.group || !bod.radii || !this.isReady()) return;
		var p = zero.core.util.posser(bod.placer.position),
			sprax = bod.positioner2axis(spr.name);
		p[sprax] = spr.target;
		var solid = this.getSolid(p, bod.radii, true);
		bod.obstructed[spr.name] = solid;
		if (solid) {
			if (!p.x && !p.z) // spawning (meh?)
				spr.target = spr.value = solid.bounds.max[sprax] + 100;
			else
				spr.target = spr.value;
		}
	},
	setVolumes: function() {
		if (this.speaker) {
			for (var s of Object.values(this.speaker))
				if (s.playing)
					s.setVolume();
		}
		if (this.elemental)
			for (var s of Object.values(this.elemental))
				s.setVolume();
	},
	setBounds: function() {
		this._.preboundz.forEach(f => f());
		this._.setBounds(this.getPlacer());
//		this.bounds = this.bounds || new THREE.Box3();
//		this.bounds.setFromObject(this.getPlacer());
//		if (this.floor0)
//			this.bounds.min.y = this.floor0.position().y;
		Object.values(zero.core.current.people).forEach(function(person) {
			var pb = person.body;
			pb.onReady(pb.setBounds);
		});
		this.objects.forEach(furn => furn.onReady(furn.setBounds));
		for (var kind of this._structural) {
			if (this[kind])
				for (var item in this[kind])
					this[kind][item].setBounds();
		}
		this.rain && this.rain.rebound();
		this.fog && this.fog.rebound();
		this.onbound && this.onbound(this);
		this._.postboundz.forEach(f => f());
	},
	setFriction: function(grippy) {
		this.grippy = this.opts.grippy = grippy;
		Object.values(zero.core.current.people).forEach(function(person) {
			person.setFriction();
		});
	},
	assembled: function() {
		var az = this._assembled;
		if (az.lights == this.lights.length &&
			az.objects == this.objects.length &&
			this._.assembled) {
				this.setBounds();
				if (this.opts.automatons.length)
					zero.core.auto.init(this.opts.automatons, this._.built);
				else
					this._.built();
			}
	},
	it: function(kind, cb) {
		var thaz = this;
		return function() {
			thaz._assembled[kind] += 1;
			(typeof cb == "function") ? cb() : thaz.assembled();
		};
	},
	cut: function(index, down) {
		var cl = this.cameras.length;
		if (typeof index != "number")
			index = (cl + (this._cam + (down ? -1 : 1))) % cl;
		this._cam = zero.core.camera.current = index;
		zero.core.camera.perspective();
		zero.core.camera.setSprings(20);
		zero.core.camera.move(this.cameras[this._cam]);
		return index;
	},
	updateCameras: function() {
		this.bounds.setFromObject(this.getPlacer());
		var min = this.bounds.min, max = this.bounds.max,
			dpos = this.cameras[0], cpos;
		if (!dpos) {
			cpos = zero.core.camera.position();
			dpos = [cpos.x, cpos.y, cpos.z];
		}
		this.cameras = this.opts.cameras = [dpos].concat([
			[ min.x, min.y, min.z],
			[ max.x, min.y, min.z],
			[ min.x, max.y, min.z],
			[ min.x, min.y, max.z],
			[ max.x, max.y, min.z],
			[ max.x, min.y, max.z],
			[ min.x, max.y, max.z],
			[ max.x, max.y, max.z]
		]);
	},
	addCamera: function(cam) {
		this.log("adding camera");
		if (this.opts.cameras.indexOf(cam) == -1)
			this.opts.cameras.push(cam);
		this.cameras.push(cam);
		this._cam = -1;
	},
	setLights: function(lights, cb) {
		var lig, c = 0, up = function() {
			c += 1;
			(c == lights.length) && cb();
		};
		this.log("setting lights");
		this.clearLights();
		if (!lights.length) return cb();
		for (lig of lights)
			this.addLight(lig, up, true);
	},
	addLight: function(light, cb, opts2) {
		this.log("adding light");
		if (light.variety != "ambient" && !light.position)
			light.position = [0, 0, 0];
		var part = this.attach(CT.merge(light, {
			kind: "light",
			thing: "Light"
		}), this.it("lights", cb));
		this.lights.push(part);
		(opts2 == true) && this.opts.lights.push(light);
		return part;
	},
	removeLight: function(light) {
		var index = this.lights.indexOf(light);
		this.lights.splice(index, 1);
		this.opts.lights.splice(index, 1);
		this._assembled.lights -= 1;
		this.detach(light.name);
	},
	addObject: function(obj, cb) {
		this.log("adding object");
		var part = this.attach(obj, this.it("objects", cb));
		this.objects.push(part);
		return part;
	},
	removeObject: function(obj) {
		var thing;
		if (obj.removed)
			return this.log("already removed", obj.name);
		this.log("removing object", obj.name);
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == obj.name)
				thing = this.objects[i];
		CT.data.remove(this.objects, thing);
		this._assembled.objects -= 1;
		this.detach(obj.name);
	},
	clear: function(retain_lights, unload) {
		if (retain_lights) {
			if (this.thring) {
				this.group.remove(this.thring);
				delete this.thring;
			}
			var group = this.group;
			group.children.forEach(function(child) {
				if (!child.type.endsWith("Light"))
					group.remove(child);
			});
		} else
			unload ? this.unload() : this.remove();
	},
	clearLights: function() {
		var i, lz = this.lights, ln = lz.length;
		for (i = ln - 1; i >= 0; i--)
			this.removeLight(lz[i]);
	},
	clearBox: function() {
		var opts = this.opts, detach = this.detach;
		opts.shell && detach("shell");
		opts.outside && detach("sky");
		this._structural.forEach(function(cat) {
			opts[cat] && opts[cat].parts.forEach(part => detach(part.name));
		});
	},
	clearObjects: function() {
		this.opts.objects.forEach(this.removeObject);
	},
	unload: function() {
		this.log("UNLOADING!");
		zero.core.auto.unload();
		this.remove();
	},
	getPlacer: function() {
		this.placer = this.placer || this.thring || this.getGroup();
		return this.placer;
	},
	getGroup: function() {
		this.group = this.group || new THREE.Object3D();
		return this.group;
	},
	postassemble: function() {
		var opts = this.opts;
		opts.lights.forEach(this.addLight);
		opts.cameras.forEach(this.addCamera);
		opts.objects.forEach(this.addObject);
	},
	addEnv: function(ename) {
		var thaz = this;
		this.attach({
			name: ename,
			kind: "particles",
			thing: "Particles",
			bounder: this
		});
		setTimeout(function() {
			thaz[ename].rebound();
		});
	},
	buildNatural: function(variety) { // flora or fauna...
		var pz = this.opts.parts, s,
			zcn = zero.core.natural, omap = zcn.omap(variety);
		for (s in omap)
			pz.push(zcn.setter(variety, s, omap[s]));
	},
	buildStruct: function(cat) {
		var opts = this.opts, base = opts[cat];
		if (!base || !base.parts || !base.parts.length)
			return;
		var dz = base.dimensions, sdz,
			tx = base.texture || opts.texture;
			thing = "Thing", d2g = zero.core.util.d2g;
		if (["floor", "ramp", "stairs"].includes(cat))
			thing = CT.parse.capitalize(cat);
		base.parts.forEach(function(side, i) {
			sdz = side.dimensions || dz;
			opts.parts.push(CT.merge(side, {
				name: cat + i,
				kind: cat,
				thing: thing,
				texture: tx,
				material: base.material,
				geometry: sdz && d2g(sdz),
				castShadow: opts.shadows,
				receiveShadow: opts.shadows
			}));
		});
	},
	elecBase: function(cat) {
		var appz = this.opts.electrical.appliances;
		if (!appz[cat])
			appz[cat] = { parts: [] };
		return appz[cat];
	},
	elecPart: function(cat, app, i) {
		var base = this.elecBase(cat), pbase = {
			kind: cat,
			circuit: base.circuit || "default"
		};
		if (cat == "panel")
			pbase.thing = "Panel";
		else
			pbase.subclass = zero.core.Appliance[CT.parse.capitalize(cat)];
		if (typeof i != "number")
			i = base.parts.length;
		return CT.merge(app, {
			index: i,
			name: cat + i
		}, pbase);
	},
	addElec: function(cat, part, index) {
		return this.attach(this.elecPart(cat, part, index));
	},
	buildAppliances: function(cat) {
		var oz = this.opts;
		oz.parts = oz.parts.concat(this.elecBase(cat).parts.map((a, i) => this.elecPart(cat, a, i)));
	},
	buildElectrical: function() {
		var oz = this.opts, pz = oz.parts,
			el = oz.electrical, appy = zero.core.Appliance;
		let app, p;
		appy.initCircuits(el.circuits);
		this._electrical.forEach(this.buildAppliances);
	},
	preassemble: function() {
		var opts = this.opts, os = opts.shell, oso,
			d2g = zero.core.util.d2g;
		if (os) {
			oso = CT.merge({
				name: "shelly",
				kind: "shell",
				receiveShadow: opts.shadows,
				geometry: d2g(os.dimensions),
				material: {
					side: THREE.BackSide
				}
			}, os);
			if (opts.texture && !oso.texture)
				oso.texture = opts.texture;
			opts.parts.push(oso);
			this.hardbounds = new THREE.Box3();
			var hbmin = this.hardbounds.min,
				hbmax = this.hardbounds.max;
			this.xyz(function(dim, i) {
				hbmin[dim] = hbmax[dim] = os.dimensions[i] / 2;
				hbmin[dim] *= -1;
			});
		}
		opts.outside && opts.parts.push({
			name: "sky",
			kind: "celestial",
			matcat: "Basic",
			sphereGeometry: true,
			texture: opts.outside,
			scale: [opts.skyscale, opts.skyscale, opts.skyscale],
			material: {
				side: THREE.BackSide
			}
		});
		opts.fog && opts.parts.push({
			name: "fog",
			kind: "particles",
			thing: "Particles",
			bounder: this
		});
		opts.rain && opts.parts.push({
			name: "rain",
			kind: "particles",
			thing: "Particles",
			bounder: this
		});
		this._structural.forEach(this.buildStruct);
		["flora", "fauna"].forEach(this.buildNatural);
		this.buildElectrical();
	},
	components: function() {
		var o, cz = [{
			identifier: "Room: " + this.name,
			owners: this.opts.owners
		}], ppref = this.name + " furnishings";
		for (o of this.opts.objects)
			cz = cz.concat(zero.core.util.components(o, ppref));
		return cz;
	},
	setShadows: function(shouldShad) {
		this.opts.receiveShadow = shouldShad;
		camera.setShadows(shouldShad);
	},
	init: function(opts) {
		var eopts = opts.environment && CT.require("environments." + opts.environment, true);
		this.opts = opts = CT.merge({
			material: CT.merge(opts.material, eopts && eopts.material)
		}, opts, eopts, this.opts, {
			lights: [],  // Lights
			objects: [], // regular Things
			cameras: [],
			automatons: [],
			electrical: {
				circuits: { default: {} },
				appliances: {}
			},
			skyscale: 10000,
			shadows: false
		});
		this.setShadows(opts.shadows);
		this.shelled = !!opts.stripset;
		if (opts.outside && !this.shelled) {
			opts.material.transparent = true;
			opts.material.opacity = opts.material.opacity || 0;
		}
		this.lights = [];
		this.objects = [];
		this.cameras = [];
		this.automatons = [];
		this.onReady(zero.core.util.procRoomCbs);
		zero.core.util.onCurPer(() => this.setFriction(opts.grippy));
	}
}, zero.core.Thing);