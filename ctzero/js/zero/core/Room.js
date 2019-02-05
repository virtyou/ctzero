zero.core.Room = CT.Class({
	CLASSNAME: "zero.core.Room",
	addLight: function(light) {
		this.log("adding light");
		if (this.opts.lights.indexOf(light) == -1)
			this.opts.lights.push(light);
		this.lights.push(new zero.core.Light(light));
	},
	addObject: function(obj) {
		this.log("adding object");
		if (this.opts.objects.indexOf(obj) == -1)
			this.opts.objects.push(obj);
		var thing = new zero.core[obj.thing || "Thing"](obj);
		this.objects.push(thing);
		this[thing.name] = thing;
	},
	removeObject: function(obj) {
		this.log("removing object");
		var thing;
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == obj.name)
				thing = this.objects[i];
		CT.data.remove(this.objects, thing);
		this.remove(obj.name, true);
	},
	addCamera: function(cam) {
		this.log("adding camera");
		if (this.opts.cameras.indexOf(cam) == -1)
			this.opts.cameras.push(cam);
		this.cameras.push(cam);
		this._cam = -1;
	},
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
	preassemble: function() {
		var opts = this.opts;
		if (opts.floor)
			opts.parts.push(CT.merge({ name: "floor" }, opts.floor));
		if (opts.wall) {
			var wall = opts.wall, dz = wall.dimensions;
			wall.sides.forEach(function(side) {
				opts.parts.push(CT.merge(side, {
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
		opts.lights.forEach(this.addLight);
		opts.objects.forEach(this.addObject);
		opts.cameras.forEach(this.addCamera);
	}
}, zero.core.Thing);