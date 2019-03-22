zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_assembled: function() {
		this.log("built body!");
		var dim, name, h = thiz = this,
			ac = zero.core.aspectController,
			spine = this.spine = [],
			joints = this.joints = {};
		this.opts.joints.forEach(function(part, i) {
			if (i) // hack
				h = h[part.name];
			spine.push(part.name);
		});
		this.head = h.head;
		this.head.body = this;
		this.torso.body = this;
		this.opts.joints.forEach(function(part, i) {
			for (dim in part.rotation) {
				name = part.name + "_" + dim;
				joints[name] = ac.add(part.rotation[dim], name, thiz);
				joints[name].part = spine[i];
			}
		});
		this.allbones = this.thring.skeleton.bones;
		this._.setPositioners();
		this._.setBounds();
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
		this.torso.tick();
		this.bone.position.y = this.positioners.bob.value;
		this.bone.position.x = this.positioners.weave.value;
		this.bone.position.z = this.positioners.slide.value;
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			joints: [],
			morphs: {},
//			shader: true,
			onassemble: this._assembled
		});
		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		var p, zc = zero.core;
		for (p in zc.phonemes.forms)
			this.springs[p] = zc.springController.add(zc.phonemes.forms[p], p, this);
		zero.core.morphs.init(this);
	}
}, zero.core.Thing);