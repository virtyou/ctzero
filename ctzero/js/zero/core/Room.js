zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	_assembled: {
		lights: 0,
		objects: 0
	},
	_tickers: [],
	_structural: ["obstacle", "floor", "wall", "ramp"],
	_bumpers: ["wall", "obstacle"],
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
		if (this.menagerie)
			this.menagerie.tick(dts);
		this.jostle();
	},
	bump: function(b1, b2, moshy) {
		var axis, s1, s2, v1, v2, vd, axes = ["weave", "slide"];
		zero.core.current.person.sfx("thud");
		for (axis of axes) {
			s1 = b1.springs[axis];
			s2 = b2.springs[axis];
			v1 = s1.velocity || s1.boost;
			v2 = s2.velocity;
			vd = v2 - v1;
			s1.shove = vd * moshy;
			s2.shove = -vd * moshy;
		}
	},
	jostle: function() {
		var zcc = zero.core.current, pz = zcc.people, you = zcc.person;
		if (!you) return;
		var b = you.body, pos = b.position(), rz = b.radii, pname, pbod,
			moshy = b.upon && b.upon.opts.moshy || this.opts.moshy;
		if (!moshy) return;
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
	eject: function(person, port) {
		var bod = person.body, wall = port && port.opts.wall,
			sz = bod.springs, pz = bod.positioners, dist = 500; // revise
		person.body.setFriction(false, true);
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
		setTimeout(bod.hide, 500);
	},
	inject: function(person, port) {
		var bod = person.body, wall, prop = "bob",
			sz = bod.springs, amount = -50; // revise -> should be axis diameter
		bod.setFriction(false, true);
		if (port) {
			wall = port.opts.wall;
			prop = ["slide", "weave"][wall % 2];
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
	getObject: function(pos, radii, checkY, kind, prop) {
		var k, o, obj, obst;
		for (k of this._bumpers) {
			for (o in this[k]) {
				obst = this[k][o];
				if (obst.overlaps(pos, radii, checkY))
					return obst;
			}
		}
		return this.within(pos, radii, checkY, kind, prop);
	},
	getSolid: function(pos, radii, checkY, objectsOnly) {
		return this[objectsOnly ? "within" : "getObject"](pos, radii, checkY, "solid", "state");
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
		}, i, k, flo, oz = this.opts;
		test(this.getSolid(pos, radii, false, true));
		for (k of this._structural) {
			if (oz[k]) {
				for (i = oz[k].parts.length - 1; i > -1; i--) {
					flo = this[k + i];
					flo.overlaps(pos, radii) && test(flo);
				}
			}
		}
		this.shelled && test(this);
		return winner;
	},
	getPeak: function(pos, radii) {
		return (this.getSurface(pos, radii, true) || this).getTop(pos);
	},
	ebound: function(spr, bod) {
		if (!bod.group || !bod.radii) return;
		var p = zero.core.util.posser(bod.placer.position),
			sprax = bod.positioner2axis(spr.name);
		p[sprax] = spr.target;
		var solid = this.getSolid(p, bod.radii, true);
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
		this._.setBounds(this.getPlacer());
//		this.bounds = this.bounds || new THREE.Box3();
//		this.bounds.setFromObject(this.getPlacer());
//		if (this.floor0)
//			this.bounds.min.y = this.floor0.position().y;
		Object.values(zero.core.current.people).forEach(function(person) {
			person.body.group && person.body.setBounds();
		});
		this.objects.forEach(furn => furn.setBounds());
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
		this.log("removing object");
		var thing;
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
	preassemble: function() {
		var opts = this.opts, d2g = function(dz) {
			return new THREE.CubeGeometry(dz[0], dz[1], dz[2], dz[3], dz[4]); // ugh
		}, os = opts.shell;
		os && opts.parts.push(CT.merge({
			name: "shelly",
			kind: "shell",
			geometry: d2g(os.dimensions),
			material: {
				side: THREE.BackSide
			}
		}, os));
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
		opts.garden && opts.parts.push({
			name: "garden",
			kind: "natural",
			collection: opts.garden,
			subclass: zero.core.Flora.Garden
		});
		opts.menagerie && opts.parts.push({
			name: "menagerie",
			kind: "natural",
			collection: opts.menagerie,
			subclass: zero.core.Fauna.Menagerie
		});
		this._structural.forEach(function(cat) {
			var base = opts[cat];
			if (base && base.parts && base.parts.length) {
				var dz = base.dimensions, sdz,
					tx = base.texture || opts.texture;
					thing = "Thing";
				if (cat == "floor")
					thing = "Floor";
				else if (cat == "ramp")
					thing = "Ramp";
				base.parts.forEach(function(side, i) {
					sdz = side.dimensions || dz;
					opts.parts.push(CT.merge(side, {
						name: cat + i,
						kind: cat,
						thing: thing,
						texture: tx,
						material: base.material,
						geometry: sdz && d2g(sdz)
					}));
				});
			}
		});
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
	init: function(opts) {
		var eopts = opts.environment && CT.require("environments." + opts.environment, true);
		this.opts = opts = CT.merge({
			material: CT.merge(opts.material, eopts && eopts.material)
		}, opts, eopts, this.opts, {
			lights: [],  // Lights
			objects: [], // regular Things
			cameras: [],
			automatons: [],
			skyscale: 10000
		});
		this.shelled = !!opts.stripset;
		if (opts.outside && !this.shelled) {
			opts.material.transparent = true;
			opts.material.opacity = opts.material.opacity || 0;
		}
		this.lights = [];
		this.objects = [];
		this.cameras = [];
		this.automatons = [];
		zero.core.util.onCurPer(() => this.setFriction(opts.grippy));
	}
}, zero.core.Thing);