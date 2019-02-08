zero.core.Thing = CT.Class({
	CLASSNAME: "zero.core.Thing",
	_: {
		customs: [], // stored here, only tick()ed in Thing subclasses that implement tick()
		ready: false,
		built: function() {
			var thiz = this;
			this.opts.onassemble && this.opts.onassemble();
			this.opts.onbuild && this.opts.onbuild(this);
			this.opts.iterator && this.opts.iterator(this);
			this._.ready = true;
			this.opts.onclick && zero.core.click.register(this, function() {
				thiz.opts.onclick(thiz);
			});
			this.opts.scroll && this.scroll();
		}
	},
	isReady: function() {
		return this._.ready;
	},
	unscroll: function() {
		if (this._.scroller) {
			zero.core.util.untick(this._.scroller);
			delete this._.scroller;
		}
	},
	scroll: function(_opts) {
		var opts = this.opts.scroll = CT.merge(_opts, this.opts.scroll, {
			axis: "y",
			speed: 0.05
		}), map = this.material.map;
		this.unscroll();
		this._.scroller = function(dts) {
			var t = zero.core.util.elapsed;
			map.offset[opts.axis] = opts.speed * t;
			if (opts.repeat) {
				var r = opts.repeat;
				map.repeat[r.axis || "y"] = (r.degree || 2) * (1 + Math.sin((r.speed || opts.speed) * t));
			}
		};
		zero.core.util.ontick(this._.scroller);
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
	place: function() {
		var oz = this.opts, thring = this.thring || this.group;
		["position", "rotation", "scale"].forEach(function(prop) {
			var setter = thring[prop];
			setter.set.apply(setter, oz[prop]);
		});
	},
	setGeometry: function(geometry) {
		var oz = this.opts, thiz = this;
		if (this.thring) {
			this.thring.geometry.dispose();
			oz.scene.remove(this.thring);
			delete this.thring;
		}
		this.thring = new THREE[oz.meshcat](geometry, this.material);
		this.place();
		this.setBone();
		(this.bone || oz.scene).add(this.thring);
		for (var m in this.opts.mti)
			this.morphTargetInfluences(m, this.opts.mti[m]);
		this.assemble();
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
	morphTargetInfluences: function(influence, target, additive, positive) {
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
	remove: function() {
		if (this.thring)
			this.opts.scene.remove(this.thring);
		if (this.group)
			this.opts.scene.remove(this.group);
	},
	detach: function(cname, fromScene) {
		var thing = this[cname],
			thrings = [thing.thring, thing.group],
			parent = fromScene ? zero.core.camera.scene : this.group;
		thrings.forEach(function(thring) {
			thring && parent.remove(thring);
		});
		thing.isCustom && CT.data.remove(this._.customs, thing);
		CT.data.remove(this.parts, thing);
		this.unscroll();
		delete this[cname];
		if (thing.opts.kind && this[thing.opts.kind]) {
			delete this[thing.opts.kind][thing.opts.name];
			if (!Object.keys(this[thing.opts.kind]))
				delete this[thing.opts.kind];
		}
	},
	attach: function(child, iterator, oneOff) {
		var thing, customs = this._.customs, childopts = CT.merge(child, {
			scene: this.group,
			path: this.path,
			iterator: function(tng) {
				child.custom && customs.push(tng); // for tick()ing
				iterator && iterator();
			},
			bones: this.bones || []
		});
		if (child.custom)
			thing = new zero.core.Custom(childopts);
		else
			thing = new zero.core[child.thing || "Thing"](childopts);
		this[thing.name] = thing;
		if (child.kind) {
			this[child.kind] = this[child.kind] || {};
			this[child.kind][child.name] = thing;
		}
		if (oneOff || !iterator) // one-off
			this.parts.push(thing);
		return thing;
	},
	assemble: function() {
		if (!this.parts) {
			this.preassemble && this.preassemble();
			var thiz = this, i = 0,
				group = this.group = this.bone || new THREE.Object3D(),
				iterator = function() {
					i += 1;
					if (i >= thiz.opts.parts.length) {
						if (!thiz.bone && i == thiz.opts.parts.length)
							thiz.opts.scene.add(group);
						thiz._.built();
					}
				};
			this.parts = this.opts.parts.map(function(p) {
				return thiz.attach(p, iterator);
			});
			this.postassemble && this.postassemble();
			if (!this.opts.parts.length) {
				i -= 1;
				iterator();
			}
		}
	},
	build: function() {
		var oz = this.opts;
		if (oz.cubeGeometry) {
			var g = oz.cubeGeometry;
			oz.geometry = new THREE.CubeGeometry(g[0], g[1], g[2]); // better way?
		}
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
	snapshot: function() {
		return CT.merge({
			parts: this.parts && this.parts.map(function(p) {
				return p.snapshot();
			})
		}, this.min_opts);
	},
	setName: function(opts) {
		this.name = opts.name;
		this.path = opts.path ? (opts.path + "." + opts.name) : opts.name;
	},
	init: function(opts) {
		this.min_opts = opts;
		this.opts = opts = CT.merge(opts, {
			path: null,
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
			mti: {},
			springs: {},
			aspects: {},
			tickers: {},
			morphStack: null,
			iterator: null,
			onbuild: null, // also supports: "onassemble"
			scroll: null
		});
		this.setName(opts);
		var thiz = this, iz, name;
		["spring", "aspect", "ticker"].forEach(function(influence) {
			iz = influence + "s", influences = thiz[iz] = {};
			for (name in opts[iz])
				thiz[iz][name] = zero.core[influence + "Controller"].add(opts[iz][name], name, thiz);
		});
		if (opts.morphStack) { // required for Body (for instance)
			var ms = CT.require("morphs." + opts.morphStack, true);
			this.morphStack = ms.stack; 
			this.base = ms.base;
		}
		setTimeout(function() {
			thiz.opts.deferBuild || thiz.build();
		}); // next post-init tick
	}
});