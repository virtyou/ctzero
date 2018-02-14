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
			this.allbones = this.thring.skeleton.bones;
		}
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
	tick: function() {
		this._setRotation();
		this.head.tick();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, opts, {
			joints: [],
			onassemble: this._assembled
		});
	}
}, zero.core.Thing);