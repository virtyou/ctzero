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
		this.objects.push(new zero.core.Thing(obj));
	},
	addCamera: function(cam) {
		this.log("adding camera");
		if (this.opts.cameras.indexOf(cam) == -1)
			this.opts.cameras.push(cam);
		this.cameras.push(cam);
		this._cam = -1;
	},
	cut: function(index) {
		if (typeof index != "number")
			index = (this._cam + 1) % this.cameras.length;
		this._cam = index;
		zero.core.camera.move(this.cameras[this._cam]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
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