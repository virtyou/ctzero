zero.core.Custom = CT.Class({
	CLASSNAME: "zero.core.Custom",
	build: function() {
		var thiz = this;
		this.group = new THREE.Object3D();
		this.isCustom = true;
		this.place();
		// custom() must:
		// - call iterator() post-init
		// - return object with tick() (bonus points: name, thrings[])
		if (typeof this.opts.custom == "string") // from server
			this.opts.custom = eval(this.opts.custom);
		this.tick = this.opts.custom({
			scene: this.group,
			iterator: function() {
				thiz.opts.scene.add(thiz.group);
				thiz._.built();
			}
		}).tick; // thrings[]?
	}
}, zero.core.Thing);