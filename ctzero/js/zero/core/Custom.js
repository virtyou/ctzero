zero.core.Custom = CT.Class({
	CLASSNAME: "zero.core.Custom",
	build: function() {
		this.isCustom = true;
		this.place();
	},
	setName: function(opts) {
		var thiz = this;
		this.group = new THREE.Object3D();
		// custom() must:
		// - call iterator() post-init
		// - return object with tick() (bonus points: name, thrings[])
		if (typeof this.opts.custom == "string") // from server
			this.opts.custom = eval(this.opts.custom);
		this.custom_rep = this.opts.custom({
			scene: this.group,
			iterator: function() {
				thiz.opts.scene.add(thiz.group);
				thiz._.built();
			}
		}); // thrings[]?
		this.tick = this.custom_rep.tick;
		this.name = opts.name = this.custom_rep.name || opts.name;
		this.path = opts.path ? (opts.path + "." + opts.name) : opts.name;
	}
}, zero.core.Thing);