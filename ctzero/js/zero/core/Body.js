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
		this._.setPositioners();
		this._.setBounds();
	},
	preassemble: function() {
		// TEMPORARY MID-REFACTOR PREASSAMBLE HACK!!!
		this.opts.parts = [];
		this.opts.parts.push({
			name: "looker",
			position: [0, 35, 25],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push({
			name: "lookAt",
			position: [0, 35, 55],
			cubeGeometry: [1, 1, 5],
			material: {
			    color: 0x00ff00,
			    visible: false
			}
		});
		this.opts.parts.push(CT.merge(this.opts.head, {
			// TODO: parts!
			//morphStack: "one.head",
			name: "head",
			thing: "Head",
			texture: "/blob/6",
			stripset: "/models/head.js",
			meshcat: "SkinnedMesh",
			material: { skinning: true }
		}));
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
		this.group.position.y = this.positioners.bob.value;
		this.group.position.x = this.positioners.weave.value;
		this.group.position.z = this.positioners.slide.value;
//		zero.core.morphs.tick(this);
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


		// TEMPORARY MID-REFACTOR HACK!!!
		opts.stripset = "/models/bod.js";
		opts.texture = "/maps/shirt.jpg";


		opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		var p, zc = zero.core;
		for (p in zc.phonemes.forms)
			this.springs[p] = zc.springController.add(zc.phonemes.forms[p], p, this);
		zero.core.morphs.init(this);
	}
}, zero.core.Thing);