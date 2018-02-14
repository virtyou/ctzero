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
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			lights: [], // Lights
			objects: [] // regular Things
		});
		this.lights = [];
		this.objects = [];
		opts.lights.forEach(this.addLight);
		opts.objects.forEach(this.addObject);
	}
}, zero.core.Thing);