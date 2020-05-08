zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	_assembled: {
		lights: 0,
		objects: 0
	},
	tick: function(dts) {
		this.objects.forEach(function(obj) {
			obj.tick && obj.tick(dts);
		});
	},
	eject: function(person, port) {
		var bod = person.body, wall = port && port.opts.wall,
			sz = bod.springs, pz = bod.positioners, dist = 500; // revise
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
	},
	inject: function(person, port) {
		var bod = person.body, wall, prop = "bob",
			sz = bod.springs, amount = -500; // revise -> should be axis diameter
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
		setTimeout(bod.bindAxis, 2000, prop);
	},
	getObject: function(pos) {
		var i, obj;
		for (i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			if (obj.opts.kind == "furnishing" && obj.overlaps(pos))
				return obj;
		}
	},
	setBounds: function() {
		this.bounds = this.bounds || new THREE.Box3();
		this.bounds.setFromObject(this.thring);
		(Object.values(zero.core.current.people)).forEach(function(person) {
			person.body.setBounds();
		});
		this.objects.forEach(function(furn) {
			furn.setBounds();
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
	cut: function(index) {
		if (typeof index != "number")
			index = (this._cam + 1) % this.cameras.length;
		this._cam = index;
		zero.core.camera.move(this.cameras[this._cam]);
	},
	updateCameras: function() {
		this.bounds.setFromObject(this.thring);
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
		if (opts.floor)
			detach("floor");
		opts.wall && opts.wall.sides.forEach(function(side, i) {
			detach("wall" + i);
		});
	},
	clearObjects: function() {
		this.opts.objects.forEach(this.removeObject);
	},
	postassemble: function() {
		var opts = this.opts;
		opts.lights.forEach(this.addLight);
		opts.cameras.forEach(this.addCamera);
		opts.objects.forEach(this.addObject);
		this.placer = this.thring;
	},
	preassemble: function() {
		var opts = this.opts;
		if (opts.floor)
			opts.parts.push(CT.merge({ name: "floor" }, opts.floor));
		if (opts.wall) {
			var wall = opts.wall, dz = wall.dimensions;
			wall.sides.forEach(function(side, i) {
				opts.parts.push(CT.merge(side, {
					name: "wall" + i,
					kind: "wall",
					texture: wall.texture,
					material: wall.material,
					geometry: new THREE.CubeGeometry(dz[0], dz[1], dz[2], dz[3], dz[4]) // ugh
				}));
			});
		}
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
	}
}, zero.core.Thing);