zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	tick: function(dts) {
		this.objects.forEach(function(obj) {
			obj.tick && obj.tick(dts);
		});
	},
	cut: function(index) {
		if (typeof index != "number")
			index = (this._cam + 1) % this.cameras.length;
		this._cam = index;
		zero.core.camera.move(this.cameras[this._cam]);
	},
	addCamera: function(cam) {
		this.log("adding camera");
		if (this.opts.cameras.indexOf(cam) == -1)
			this.opts.cameras.push(cam);
		this.cameras.push(cam);
		this._cam = -1;
	},
	addLight: function(light) {
		this.log("adding light");
		this.lights.push(this.attach(CT.merge(light, {
			kind: "light",
			thing: "Light"
		})));
	},
	removeLight: function(light) {
		var index = this.lights.indexOf(light);
		this.lights.splice(index, 1);
		this.opts.lights.splice(index, 1);
		this.detach(light.name);
	},
	addObject: function(obj) {
		this.log("adding object");
		this.objects.push(this.attach(obj));
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
				this.opts.scene.remove(this.thring);
				delete this.thring;
			}
			var group = this.group;
			group && group.children.forEach(function(child) {
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
		opts.objects.forEach(this.addObject);
		opts.cameras.forEach(this.addCamera);
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
		this.opts = opts = CT.merge(eopts, this.opts, {
			lights: [],  // Lights
			objects: [], // regular Things
			cameras: []
		});
		this.lights = [];
		this.objects = [];
		this.cameras = [];
	}
}, zero.core.Thing);