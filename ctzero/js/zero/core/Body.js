zero.core.Body = CT.Class({
	CLASSNAME: "zero.core.Body",
	_xyz: ["weave", "bob", "slide"],
	_assembled: function() {
		this.log("built body!");
		this.head.body = this;
		this.torso = new zero.core.Torso({
			body: this,
			bmap: this.bmap,
			bones: this.bones
		});
		this.spine = new zero.core.Spine({
			body: this,
			bones: this.bones,
			hbones: this.head.bones
		});

		// .... seems wrong
		this.bones[0].position.y = this.head.bones[0].position.y = -8;

		this._.setPositioners();
		this._.setBounds();
	},
	setFriction: function(grippy) {
		this.springs.slide.hard = this.springs.weave.hard = grippy;
	},
	preassemble: function() {
		this.opts.parts.push({
			name: "looker",
			bone: 0,
			position: [0, 35, 25],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push({
			name: "lookAt",
			bone: 0,
			position: [0, 35, 55],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
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
		var obj = zero.core.current.room.getObject(this.group.position);
		this._.bounder("y", 1, obj && obj.getTop());
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		this.head.tick();
		this.torso.tick();
		this.spine.tick();
		this.group.position.y = this.positioners.bob.value;
		this.group.position.x = this.positioners.weave.value;
		this.group.position.z = this.positioners.slide.value;
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function(opts) {
		this.opts = opts = CT.merge(this.opts, {
			joints: zero.base.joints(),
			onassemble: this._assembled
		});
		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
	}
}, zero.core.Thing);