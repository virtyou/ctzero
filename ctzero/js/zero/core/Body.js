zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_assembled: function() {
		this.log("built body!");
		this.head = this.torso.neck.head;
		this.head.body = this;
		this.torso.setBody(this);
		this.allbones = this.thring.skeleton.bones;
		this.spine = new zero.core.Spine({
			body: this,
			bones: this.allbones
		});
		this._.setPositioners();
		this._.setBounds();
	},
	move: function(ropts) {
		this.torso.move(ropts);
		this.spine.move(ropts.spine);
	},
	resize: function(ropts) {
		this.torso.resize(ropts);
		this.spine.resize(ropts.spine);
	},
	setBob: function() {
		var obj = zero.core.current.room.getObject(this.bone.position);
		this._.bounder("y", 1, obj && obj.getTop());
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		this.head.tick();
		this.torso.tick();
		this.spine.tick();
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