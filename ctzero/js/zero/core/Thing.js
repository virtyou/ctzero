zero.core.Thing = CT.Class({
	CLASSNAME: "zero.core.Thing",
	_: {
		customs: [], // stored here, only tick()ed in Thing subclasses that implement tick()
		ready: false,
		built: function() {
			this.opts.onassemble && this.opts.onassemble();
			this.opts.onbuild && this.opts.onbuild(this);
			this.opts.iterator && this.opts.iterator();
			this._.ready = true;
		}
	},
	isReady: function() {
		return this._.ready;
	},
	look: function(pos) {
		var myPos = this.position(null, true);
		this.thring.lookAt({
			x: pos.x - myPos.x,
			y: pos.y - myPos.y,
			z: pos.z - myPos.z
		});
	},
	// position(), rotation(), scale(): getters _and_ setters
	position: function(position, world) {
		if (position)
			this.update({ position: position });
		else {
			var thring = (this.thring || this.group);
			if (world)
				return thring.getWorldPosition();
			return thring.position;
		}
	},
	rotation: function(rotation) {
		if (rotation)
			this.update({ rotation: rotation });
		else
			return (this.thring || this.group).rotation;
	},
	scale: function(scale) {
		if (scale) {
			if (typeof scale == "number")
				scale = [scale, scale, scale];
			this.update({ scale: scale });
		}
		else
			return (this.thring || this.group).scale;
	},
	setBone: function() {
		var oz  = this.opts;
		if (oz.bones.length || this.thring && this.thring.skeleton) {
			if (this.thring && this.thring.skeleton) {
				this.bones = this.thring.skeleton.bones.slice(0, oz.joints.length);
				this.bone = this.bones[0];
			} else {
				this.bones = oz.bones.slice();
				this.bone = this.bones.shift();
			}
			if (this.thring && this.thring.skeleton) // 1st bone
				oz.scene.add(this.bone);
		}
	},
	setGeometry: function(geometry) {
		var oz = this.opts, thiz = this;
		if (this.thring) {
			this.thring.geometry.dispose();
			oz.scene.remove(this.thring);
			delete this.thring;
		}
		this.thring = new THREE[oz.meshcat](geometry, this.material);
		["position", "rotation", "scale"].forEach(function(prop) {
			var setter = thiz.thring[prop];
			setter.set.apply(setter, oz[prop]);
		});
		this.setBone();
		(this.bone || oz.scene).add(this.thring);
		for (var m in this.opts.morphs)
			this.morph(m, this.opts.morphs[m]);
		if (this.opts.parts.length)
			this.assemble();
		else
			this._.built();
	},
	adjust: function(property, dimension, value) {
		if (this.thring)
			this.thring[property][dimension] = value;
		if (this.group)
			this.group[property][dimension] = value;
	},
	update: function(opts) {
		var o, setter, full, adjust = this.adjust;
		["texture", "stripset", "geometry", "matcat", "meshcat",
			"material", "repeat", "offset"].forEach(function(item) {
				full = full || (item in opts);
			});
		this.opts = CT.merge(opts, this.opts);
		if (!(this.thring || this.group)) return; // hasn't built yet, just wait
		if (full)
			return this.build();
		for (o in opts) {
			["position", "rotation", "scale"].forEach(function(prop) {
				if (o == prop) {
					zero.core.util.coords(opts[prop], function(dim, val) {
						adjust(o, dim, val);
					});
				}
			});
		}
	},
	vary: function(variant) {
		this.update(this.opts.variants[variant]);
	},
	morph: function(influence, target, additive, positive) {
		var mti = this.thring && this.thring.morphTargetInfluences;
		if (mti) {
			mti[influence] = additive ? mti[influence] + target : target;
			if (positive && mti[influence] < 0)
				mti[influence] = 0;
		}
	},
	toggle: function(influence) {
		var mti = this.thring && this.thring.morphTargetInfluences;
		if (mti)
			mti[influence] = mti[influence] ? 0 : 1;
	},
	assemble: function() {
		if (this.opts.parts.length && !this.parts) {
			var group, childopts, thing, thiz = this, i = 0, iterator = function() {
				i += 1;
				if (i >= thiz.opts.parts.length) {
					if (!thiz.bone && i == thiz.opts.parts.length)
						thiz.opts.scene.add(group);
					thiz._.built();
				}
			};
			group = this.group = this.bone || new THREE.Object3D();
			this.parts = this.opts.parts.map(function(child) {
				childopts = CT.merge(child, {
					scene: group,
					iterator: iterator,
					bones: thiz.bones || []
				});
				if (child.custom) {
					 // custom() must:
					 // - call iterator() post-init
					 // - return object w/ name and tick()
					thing = child.custom(childopts);
					thiz._.customs.push(thing);
				} else
					thing = new zero.core[child.thing || "Thing"](childopts);
				thiz[thing.name] = thing;
				return thing;
			});
		}
	},
	build: function() {
		var oz = this.opts;
		if (oz.geometry || oz.stripset) {
			var meshname = (oz.shader ? "Shader"
				: ("Mesh" + oz.matcat)) + "Material",
				map, meshopts = oz.material;
			if (oz.texture) {
				map = THREE.ImageUtils.loadTexture(oz.texture);
				if (oz.repeat) {
					map.wrapS = map.wrapT = THREE.RepeatWrapping;
					map.repeat.set.apply(map.repeat, oz.repeat);
				}
				map.offset.set.apply(map.offset, oz.offset);
				meshopts = CT.merge(meshopts, { map: map });
			}
			if (oz.shader) {
				meshopts.vertexShader = zero.core.shaders.vertex(this);
				meshopts.fragmentShader = zero.core.shaders.fragment(this);
				meshopts.uniforms = zero.core.shaders.uniforms(this, map);
				meshopts.attributes = zero.core.shaders.attributes(this);
			}
			if (this.material) {
				this.material.dispose();
				delete this.material;
			}
			this.material = new THREE[meshname](meshopts);
			if (oz.stripset)
				(new THREE.JSONLoader(true)).load(oz.stripset, this.setGeometry);
			else
				this.setGeometry(oz.geometry);
		} else {
			this.setBone();
			this.assemble();
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			name: "Thing" + Math.floor(Math.random() * 1000),
			scene: zero.core.camera.scene,
			parts: [],
			bones: [],
			texture: "",
			stripset: "",
			geometry: null, // or a THREE.CubeGeometry or something
			matcat: "Basic", // or "Phong"
			meshcat: "Mesh", // or "SkinnedMesh" etc
			material: {}, // color etc
			repeat: null, // or [1, 1] (for instance)
			offset: [0, 0],
			position: [0, 0, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			variants: {},
			morphs: {},
			springs: {},
			aspects: {},
			tickers: {},
			morphStack: null,
			iterator: null,
			onbuild: null // also supports: "onassemble"
		});
		this.name = opts.name;
		var thiz = this, iz, name;
		["spring", "aspect", "ticker"].forEach(function(influence) {
			iz = influence + "s", influences = thiz[iz] = {};
			for (name in opts[iz])
				thiz[iz][name] = zero.core[influence + "Controller"].add(opts[iz][name], name, thiz);
		});
		if (opts.morphStack) { // required for Head (for instance)
			var ms = CT.require("morphs." + opts.morphStack, true);
			this.morphStack = ms.stack; 
			this.base = ms.base;
		}
		setTimeout(this.build); // next post-init tick
	}
});