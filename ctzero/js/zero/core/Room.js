zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	_assembled: {
		lights: 0,
		objects: 0
	},
	tick: function(dts, rdts) {
		for (var obj of this.objects)
			obj.tick && obj.tick(dts, rdts);
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
		var i, o, obj, obst;
		for (o in this.obstacle) {
			obst = this.obstacle[o];
			if (obst.overlaps(pos, radii, checkY))
				return obst;
		}
		for (i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			if (obj.opts.kind == "furnishing" && obj.overlaps(pos, radii, checkY))
				return obj;
		}
	},
	getSurface: function(pos, radii) {
		var i, flo, obj = this.getObject(pos, radii);
		if (obj && obj.getTop() < pos.y) return obj;
		if (!this.opts.floor) return;
		for (i = this.opts.floor.parts.length - 1; i > -1; i--) {
			flo = this["floor" + i];
			if (pos.y > flo.getTop() && flo.overlaps(pos, radii))
				return flo;
		}
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
		for (var kind of ["obstacle", "floor"]) {
			if (this[kind])
				for (var item in this[kind])
					this[kind][item].setBounds();
		}
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
		["obstacle", "floor", "wall"].forEach(function(cat) {
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
	preassemble: function() {
		var opts = this.opts, d2g = function(dz) {
			return new THREE.CubeGeometry(dz[0], dz[1], dz[2], dz[3], dz[4]); // ugh
		}, os = opts.shell;
		os && opts.parts.push(CT.merge({
			name: "shell",
			kind: "shell",
			geometry: d2g(os.dimensions)
		}, os));
		["obstacle", "floor", "wall"].forEach(function(cat) {
			var base = opts[cat];
			if (base && base.parts && base.parts.length) {
				var dz = base.dimensions,
					thing = cat == "floor" && "Floor" || "Thing";
				base.parts.forEach(function(side, i) {
					opts.parts.push(CT.merge(side, {
						name: cat + i,
						kind: cat,
						thing: thing,
						texture: base.texture,
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
		this.setFriction(opts.grippy);
	}
}, zero.core.Thing);