zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_assembled: function() {
		this.log("built body!");
		if (this.opts.joints.length) {
			var dim, name, h = this, head,
				spine = this.spine = [],
				joints = this.joints = {};
			this.opts.joints.forEach(function(part, i) {
				if (i) // hack
					h = h[part.name];
				spine.push(part.name);
			});
			head = this.head = h.head;
			this.head.body = this;
			this.opts.joints.forEach(function(part, i) {
				for (dim in part.rotation) {
					name = part.name + "_" + dim;
					joints[name] = aspect.add(part.rotation[dim], name, head);
					joints[name].part = spine[i];
				}
			});
			var pos = this.position();
			this.bone.position.set(pos.x, pos.y, pos.z);
			this.allbones = this.thring.skeleton.bones;
		}
		this.thring.frustumCulled = false; // TODO: figure out real problem and fix!!!
	},
	_setRotation: function() {
		var bonez = this.thring.skeleton.bones,
			j, joint, name, axis;
		for (j in this.joints) {
			joint = this.joints[j];
			[name, axis] = j.split("_");
			bonez[this.spine.indexOf(name)].rotation[axis] = joint.value;
		}
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		this._setRotation();
		this.head.tick();
		if (this.springs.bob)
			this.bone.position.y = this.springs.bob.value;
		if (this.springs.weave)
			this.bone.position.x = this.springs.weave.value;
		if (this.springs.slide)
			this.bone.position.z = this.springs.slide.value;
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			joints: [],
			onassemble: this._assembled
		});
	}
}, zero.core.Thing);