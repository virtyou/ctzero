zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	_assembled: {
		lights: 0,
		objects: 0
	},
	_tickers: [],
	_structural: ["obstacle", "floor", "wall", "ramp"],
	_bumpers: ["wall", "obstacle"],
	_surfaces: ["floor", "ramp"],
	tick: function(dts, rdts) {
		var obj;
		for (obj of this.objects)
			obj.tick && obj.tick(dts, rdts);
		for (obj of this._tickers)
			obj.tick(dts, rdts);
		if (this.particles)
			for (obj in this.particles)
				this.particles[obj].tick(dts, rdts);
		this.jostle();
	},
	bump: function(b1, b2) {
		var axis, sb;
		for (axis in ["weave", "bob", "slide"]) {
			sb = b1.springs[axis].boost;
			b1.springs[axis].boost = b2.springs[axis].boost * 2;
			b2.springs[axis].boost = sb * 2;
		}
	},
	jostle: function() {
		var zcc = zero.core.current, pz = zcc.people, you = zcc.person;
		if (!you) return;
		var b = you.body, pos = b.position(), rz = b.radii, pname, pbod;
		if (!(b.upon && b.upon.opts.moshy)) return;
		for (pname in pz) {
			pbod = pz[pname].body;
			if ((pname == you.name) || (pbod.upon != b.upon)) continue;
			pbod.overlaps(pos, rz, true) && this.bump(b, pbod);
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
			sz = bod.springs, amount = -500; // revise -> should be axis diameter
		bod.setFriction(false, true);
		if (port) {
			wall = port.opts.wall;
			prop = ["slide", "weave"][wall % 2];
			if (wall == 1 || wall == 2)
				amount *= -1;
			person.body.setPositioners(port.position(), false, true);
		}
		sz[prop].value += amount;
		delete sz[prop].bounds;
		bod.positioners[prop].unbounded = true;
		setTimeout(function() {
			bod.show();
			bod.bindAxis(prop);
			bod.setFriction(person == zero.core.current.person, true);
		}, 2000);
	},
	getObject: function(pos, radii, checkY) {
		var i, k, o, obj, obst;
		for (k of this._bumpers) {
			for (o in this[k]) {
				obst = this[k][o];
				if (obst.overlaps(pos, radii, checkY))
					return obst;
			}
		}
		for (i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			if (obj.opts.kind == "furnishing" && obj.overlaps(pos, radii, checkY))
				return obj;
		}
	},
	getSurface: function(pos, radii) {
		var val, top, winner, test = function(obj) {
			if (obj) {
				val = obj.getTop(pos);
				if (val <= pos.y) {
					if (!top || val > top) {
						top = val;
						winner = obj;
					}
				}
			}
		}, i, k, flo, oz = this.opts;
		test(this.getObject(pos, radii));
		for (k of this._surfaces) {
			if (oz[k]) {
				for (i = oz[k].parts.length - 1; i > -1; i--) {
					flo = this[k + i];
					flo.overlaps(pos, radii) && test(flo);
				}
			}
		}
		return winner;
	},
	ebound: function(spr, bod) {
		if (!bod.group) return;
		var bp = bod.group.position, p = {
			x: bp.x, y: bp.y, z: bp.z
		};
		p[bod.positioner2axis(spr.name)] = spr.target;
		if (bod.radii) {
			var obj = this.getObject(p, bod.radii, true);
			if (obj && obj.opts.state == "solid")
				spr.target = spr.value;
		}
	},
	setBounds: function() {
		this.bounds = this.bounds || new THREE.Box3();
		this.bounds.setFromObject(this.getPlacer());
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
		this._cam = index;
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
	addLight: function(light, cb) {
		this.log("adding light");
		var part = this.attach(CT.merge(light, {
			kind: "light",
			thing: "Light"
		}), this.it("lights", cb));
		this.lights.push(part);
		return part;
	},
	removeLight: function(light) {
		var index = this.lights.indexOf(light);
		this.lights.splice(index, 1);
		this.opts.lights.splice(index, 1);
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
		this.detach(obj.name);
	},
	clear: function(retain_lights) {
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
			this.remove();
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
		var thaz = this, isRain = ename == "rain", eobj = CT.merge({
			name: ename,
			kind: "particles",
			thing: "Particles"
		}, zero.base.particles[ename]);
		if (isRain)
			eobj.bounder = this;
		this.attach(eobj);
		isRain && setTimeout(function() {
			thaz.rain.rebound();
		});
	},
	preassemble: function() {
		var opts = this.opts, d2g = function(dz) {
			return new THREE.CubeGeometry(dz[0], dz[1], dz[2], dz[3], dz[4]); // ugh
		}, os = opts.shell;
		os && opts.parts.push(CT.merge({
			name: "shelly",
			kind: "shell",
			geometry: d2g(os.dimensions)
		}, os));
		opts.outside && opts.parts.push({
			name: "sky",
			kind: "celestial",
			sphereGeometry: true,
			texture: opts.outside,
			scale: [100, 100, 100],
			material: {
				side: THREE.BackSide
			}
		});
		opts.fog && opts.parts.push(CT.merge({
			name: "fog",
			kind: "particles",
			thing: "Particles"
		}, zero.base.particles.fog));
		opts.rain && opts.parts.push(CT.merge({
			name: "rain",
			kind: "particles",
			thing: "Particles",
			bounder: this
		}, zero.base.particles.rain));
		this._structural.forEach(function(cat) {
			var base = opts[cat];
			if (base && base.parts && base.parts.length) {
				var dz = base.dimensions,
					tx = base.texture || opts.texture;
					thing = "Thing";
				if (cat == "floor")
					thing = "Floor";
				else if (cat == "ramp")
					thing = "Ramp";
				base.parts.forEach(function(side, i) {
					opts.parts.push(CT.merge(side, {
						name: cat + i,
						kind: cat,
						thing: thing,
						texture: tx,
						material: base.material,
						geometry: dz && d2g(dz)
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
		}, eopts, this.opts, {
			lights: [],  // Lights
			objects: [], // regular Things
			cameras: []
		});
		this.lights = [];
		this.objects = [];
		this.cameras = [];
		setTimeout(() => this.setFriction(opts.grippy), 1000);
	}
}, zero.core.Thing);