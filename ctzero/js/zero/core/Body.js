zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
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
		var spropts, poz = this.positioners = {};
		["bob", "weave", "slide"].forEach(function(dim) {
			spropts = {};
			spropts[dim] = 1;
			poz[dim] = ac.add({
				unbounded: true,
				springs: spropts
			}, dim, thiz);
		});
		this.allbones = this.thring.skeleton.bones;
		this._setBounds();
	},
	_setBounds: function() {
		var radii = this.radii = {},
			bounds = this.bounds = new THREE.Box3();
		bounds.setFromObject(this.bone);
		["x", "y", "z"].forEach(function(dim) {
			radii[dim] = (bounds.max[dim] - bounds.min[dim]) / 2;
		});
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
	setBounds: function() {
		var bz = zero.core.current.room.bounds,
			pz = this.positioners, rz = this.radii,
			sz = this.springs, bounder = function(pname, dim) {
				pz[pname].max = bz.max[dim] - rz[dim];
				pz[pname].min = bz.min[dim] + rz[dim];
				pz[pname].unbounded = false;
				sz[pname].bounds = {
					min: pz[pname].min,
					max: pz[pname].max
				};
			};
		bounder("bob", "y");
		bounder("weave", "x");
		bounder("slide", "z");
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