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
			this.opts.shift && this.shift();
		},
		setd: function(dim, springs, positioners, pos) {
			var spropts = {}, // body positioner!
				val = pos[(dim in pos) ? dim : this.positioner2axis(dim)];
			if (!springs[dim]) {
				springs[dim] = zero.core.springController.add({
					k: 10,
					damp: 5
				}, dim, this);
			}
			springs[dim].target = springs[dim].value = val;
			spropts[dim] = 1;
			positioners[dim] = zero.core.aspectController.add({
				unbounded: true,
				springs: spropts
			}, dim, this);
		},
		setGrowers: function() {
			var sca = this.scale(), pos = {
				width: sca.x,
				height: sca.y,
				depth: sca.z
			}, dim;
			this.growers = {};
			for (dim of ["width", "height", "depth"])
				this._.setd(dim, this.springs, this.growers, pos);
		},
		setFlippers: function() {
			var pos = this.rotation(), dim;
			this.flippers = {};
			for (dim of ["x", "y", "z"])
				this._.setd(dim, this.springs, this.flippers, pos);
		},
		setPositioners: function() {
			var pos = this.position(), dim;
			this.positioners = {};
			for (dim of this._xyz)
				this._.setd(dim, this.springs, this.positioners, pos);
		},
		setBounds: function() {
			var radii = this.radii = {},
				bounds = this.bounds = this.bounds || new THREE.Box3();
			bounds.setFromObject(this.group);
			["x", "y", "z"].forEach(function(dim) {
				radii[dim] = (bounds.max[dim] - bounds.min[dim]) / 2;
			});
		},
		bounder: function(dim, i, min, upspring) {
			var bz = zero.core.current.room.bounds, bax = this.bindAxis,
				pz = this.positioners, rz = this.radii,
				sz = this.springs, pname = this._xyz[i];
			pz[pname].max = bz.max[dim] - rz[dim];
			pz[pname].min = (typeof min == "number" ? min : bz.min[dim]) + rz[dim];
			if (this._yoff && dim == "y") {
				var offer = -this.bones[0].position.y;
				pz[pname].max += offer;
				pz[pname].min += offer;
			}
			this._.nosnap ? setTimeout(bax, 2000, pname) : bax(pname);
			if (upspring)
				sz[pname].target = sz[pname].value = Math.max(sz[pname].target, pz[pname].min);
			if (this._.shouldMin(pname, dim))
				sz[pname].target = pz[pname].min;
		},
		shouldMin: function(pname, dim) { // fix multifloor-zone portals!
			return dim == "y" && ["poster", "screen", "stream", "portal", "body"].indexOf(this.opts.kind) == -1;
		}
	},
	_xyz: ["x", "y", "z"],
	isReady: function() {
		return this._.ready;
	},
	show: function() {
		this.group.visible = true;
	},
	hide: function() {
		this.group.visible = false;
	},
	bindAxis: function(pname) {
		var pz = this.positioners;
		this.springs[pname].bounds = {
			min: pz[pname].min,
			max: pz[pname].max
		};
		pz[pname].unbounded = false;
	},
	setPositioners: function(xyz, unbound, snap) {
		var _xyz = this._xyz, sz = this.springs, s;
		["x", "y", "z"].forEach(function(dim, i) {
			s = sz[_xyz[i]];
			s.target = xyz[dim];
			if (unbound)
				delete s.bounds;
			if (snap)
				s.value = s.target;
		});
	},
	autoRot: function() {
		if (["poster", "screen", "stream", "portal"].indexOf(this.opts.kind) != -1 && "wall" in this.opts)
			this.adjust("rotation", "y", -this.opts.wall * Math.PI / 2);
	},
	wallStick: function() {
		if (["poster", "screen", "stream", "portal"].indexOf(this.opts.kind) != -1 && "wall" in this.opts) {
			var w = this.opts.wall, sz = this.springs;
			if (w == 0) {
				sz.z.bounds.min += 1;
				sz.z.bounds.max = sz.z.bounds.min;
			} else if (w == 1) {
				sz.x.bounds.max -= 1;
				sz.x.bounds.min = sz.x.bounds.max;
			} else if (w == 2) {
				sz.z.bounds.max -= 1;
				sz.z.bounds.min = sz.z.bounds.max;
			} else if (w == 3) {
				sz.x.bounds.min += 1;
				sz.x.bounds.max = sz.x.bounds.min;
			}
//			if (this.opts.kind == "portal")
//				sz.y.bounds.max = sz.y.bounds.min;
		}
	},
	overlaps: function(pos, radii, checkY) {
		var bz = this.bounds;
		if (!bz) return false;
		var check = function(dim) {
			return (pos[dim] + radii[dim]) > bz.min[dim]
				&& (pos[dim] - radii[dim]) < bz.max[dim];
		};
		return check("x") && check("z") && (!checkY || check("y"));
	},
	getTop: function() {
		return this.bounds.max.y;
	},
	setBounds: function(rebound, nosnap) {
		var xyz = ["x", "y", "z"], thaz = this;
		this._.nosnap = nosnap;
		this.autoRot();
		if (rebound)
			delete this.radii;
		if (!this.radii)
			this._.setBounds();
		if (!this.positioners)
			this._.setPositioners();
		xyz.forEach(this._.bounder);
		this.wallStick();
		if (!this.tick) {
			this.tick = function() {
				var pos = thaz.position();
				xyz.forEach(function(dim) {
					pos[dim] = thaz.positioners[dim].value;
				});
			};
		}
		this.onbound && this.onbound();
	},
	playPause: function() {
		if (this.opts.video && this.material.map) {
			var vnode = this.material.map.vnode;
			if (vnode.paused)
				vnode.play();
			else
				vnode.pause();
		}
	},
	unvideo: function() {
		if (this.opts.video && this.material.map)
			this.material.map.vnode.remove();
	},
	setPull: function(pull, axis) {},
	unscroll: function(clearOpts) {
		if (this._.scroller) {
			zero.core.util.untick(this._.scroller);
			delete this._.scroller;
			this.setPull(0);
			if (clearOpts)
				this.opts.scroll = null;
		}
	},
	scroll: function(_opts) {
		var opts = this.opts.scroll = CT.merge(_opts, this.opts.scroll, {
			axis: "y",
			speed: 0.05
		}), map = this.material.map, multi = core.config.ctzero.multi,
			zsin = zero.core.trig.sin;
		this.unscroll();
		this._.scroller = function(dts, rdts) {
			var t = zero.core.util[multi ? "relapsed" : "elapsed"];
			map.offset[opts.axis] = opts.speed * t;
			if (opts.repeat) {
				var r = opts.repeat;
				map.repeat[r.axis || "y"] = (r.degree || 2) * (1 + zsin((r.speed || opts.speed) * t));
			}
		};
		var pull = opts.speed * 4500;
		if (opts.axis == "y" || this.opts.planeGeometry)
			pull *= -1;
		this.setPull(pull, {
			x: "weave",
			y: "slide"
		}[opts.axis]);
		zero.core.util.ontick(this._.scroller);
	},
	unshift: function() {
		if (this._.shifter) {
			zero.core.util.untick(this._.shifter);
			delete this._.shifter;
			this.setPull(0);
		}
	},
	shifting: function(dim) {
		var s = this.opts.shift;
		return s && s.axis == dim;
	},
	shift: function(_opts) {
		var opts = this.opts.shift = CT.merge(_opts, this.opts.shift, {
			axis: "z",
			speed: 150,
			mode: "bounce" // recycle|bounce
		}), thaz = this, setp = function() {
			thaz.setPull(opts.speed, {
				x: "weave",
				z: "slide",
//				y: "bob"
			}[opts.axis]);
		}, pos, bz, p, b, zcc = zero.core.current, multi = core.config.ctzero.multi;
		this.unshift();
		this._.shifter = function(dts, rdts) {
			if (!thaz.bounds) return;
			var s = opts.speed * (multi ? rdts : dts);
			thaz.adjust("position", opts.axis, s, true);
			if (opts.axis != "y") { // fix y elevator vert bounds ....
				thaz.bounds.min[opts.axis] += s;
				thaz.bounds.max[opts.axis] += s;
			}
			pos = thaz.placer.position[opts.axis];
			bz = zcc.room.bounds;
			if (!bz) return;
			if (pos > bz.max[opts.axis] || pos < bz.min[opts.axis]) {
				if (opts.mode == "bounce") {
					opts.speed *= -1;
					setp();
				} else { // recycle -- hacky!
					thaz.placer.position[opts.axis] *= -1;
					if (opts.axis == "y") {
						for (p in zcc.people) {
							b = zcc.people[p].body;
							if (b.springs.bob.floored) {
								if (b.upon == thaz)
									b.springs.bob.floored = false;
								else if (thaz.overlaps(b.position(), b.radii))
									b.setBob();
							}
						}
					} else { // fix y elevator vert bounds ....
						thaz.bounds.min[opts.axis] = -thaz.bounds.max[opts.axis];
						thaz.bounds.max[opts.axis] = -thaz.bounds.min[opts.axis];
					}
				}
				multi && CT.event.emit("environment", {
					name: thaz.name,
					speed: opts.speed,
					position: thaz.placer.position[opts.axis],
					min: thaz.bounds.min[opts.axis],
					max: thaz.bounds.max[opts.axis]
				});
			}
		};
		setp();
		zero.core.util.ontick(this._.shifter);
	},
	look: function(pos) {
//		this.group.lookAt(this.group.worldToLocal(pos)); // ????
		this.group.lookAt(zero.core.util.vector(this.position(null, true), pos));
	},
	// position(), rotation(), scale(): getters _and_ setters
	position: function(position, world) {
		if (position)
			this.update({ position: position });
		else {
			if (world)
				return this.placer.getWorldPosition();
			return this.placer.position;
		}
	},
	rotation: function(rotation, world) {
		if (rotation)
			this.update({ rotation: rotation });
		else {
			if (world)
				return this.placer.getWorldRotation();
			return this.placer.rotation;
		}
	},
	scale: function(scale) {
		if (scale) {
			if (typeof scale == "number")
				scale = [scale, scale, scale];
			this.update({ scale: scale });
		}
		else
			return this.placer.scale;
	},
	localize: function(v) {
		return this.placer.worldToLocal(v.applyMatrix4 ? v : new THREE.Vector3(v.x, v.y, v.z));
	},
	setBone: function() {
		var ts = this.thring && this.thring.skeleton, gjs, ms;
		if (ts) {
			gjs = this.geojson;
			this.bones = ts.bones;
			this.bmap = gjs.bonemap;
			this.base = gjs.vertices;
			this.morphStack = ms = {};
			gjs.morphTargets.forEach(function(mt) {
				ms[mt.name] = mt.vertices;
			});
			zero.core.morphs.init(this);
		} else
			this.bones = this.opts.bones;
	},
	getPlacer: function() {
		this.placer = this.placer || new THREE.Object3D();
		return this.placer;
	},
	place: function() {
		var oz = this.opts, p = this.getPlacer();
		["position", "rotation", "scale"].forEach(function(prop) {
			var setter = p[prop];
			setter.set.apply(setter, oz[prop]);
		});
	},
	setGeometry: function(geometry, materials, json) {
		var oz = this.opts, thiz = this;
		this.geojson = json;
		if (this.thring) {
			this.thring.geometry.dispose();
			oz.scene.remove(this.thring);
			delete this.thring;
		}
		this.thring = new THREE[oz.meshcat](geometry, this.material);
		this.thring.frustumCulled = oz.frustumCulled; // should probs usually be default (true)
		this.setBone();
		for (var m in this.opts.mti)
			this.morphTargetInfluences(m, this.opts.mti[m]);
		this.place();
		this.assemble();
	},
	adjust: function(property, dimension, value, additive) {
		if (additive)
			this.placer[property][dimension] += value;
		else
			this.placer[property][dimension] = value;
	},
	update: function(opts) {
		var o, setter, full, adjust = this.adjust, zcu = zero.core.util;
		["stripset", "geometry", "matcat", "meshcat",
			"material", "repeat", "offset"].forEach(function(item) {
				full = full || (item in opts);
			});
		this.opts = CT.merge(opts, this.opts);
		if (!this.group) return; // hasn't built yet, just wait
		if (full)
			return this.build();
		if (this.material && ("texture" in opts || "video" in opts)) {
			this.material.map = (opts.texture && zcu.texture(opts.texture))
				|| (opts.video && zcu.videoTexture(opts.video.item || opts.video, this));
			this.material.needsUpdate = true;
		}
		["position", "rotation", "scale"].forEach(function(prop) {
			if (prop in opts) {
				zcu.coords(opts[prop], function(dim, val) {
					adjust(prop, dim, val);
				});
			}
		});
	},
	setTexture: function(tx) {
		this.update({ texture: tx });
	},
	setOpacity: function(op, additive) {
		var mat = this.material;
		if (!mat) return;
		if (additive)
			mat.opacity += op;
		else
			mat.opacity = op;
		return mat.opacity;
	},
	setColor: function(col) {
		if (this.material) this.material.color = col;
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
		var oz = this.opts;
		(oz.anchor || oz.scene).remove(this.group);
		this.unscroll();
		this.unshift();
		this.unvideo();
		if (oz.key)
			delete zero.core.Thing._things[oz.key];
		oz.onremove && oz.onremove();
	},
	detach: function(cname) {
		var thing = this[cname];
		if (!(thing.thring || thing.group)) { // kind map!
			thing = Object.values(thing)[0];
			cname = thing.name;
		}
		thing.remove();
		thing.isCustom && CT.data.remove(this._.customs, thing);
		CT.data.remove(this.parts, thing);
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
				tng.isCustom && customs.push(tng); // for tick()ing
				iterator && iterator();
			},
			bones: this.bones || [],
			bmap: this.bmap || {}
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
	assembled: function() {
		this._.built();
	},
	getGroup: function() {
		this.group = this.group || this.placer;
		return this.group;
	},
	assemble: function() {
		if (this.parts) return; // for rebuild update()....
		this.preassemble && this.preassemble();
		var thiz = this, oz = this.opts, i = 0,
			group = this.getGroup(),
			iterator = function() {
				i += 1;
				if (i >= oz.parts.length) {
					if (i == oz.parts.length)
						(oz.anchor || oz.scene).add(group);
					thiz._.assembled = true;
					thiz.assembled();
				}
			};
		if (oz.invisible)
			this.hide();
		this.thring && group.add(this.thring);
		this.parts = oz.parts.map(function(p) {
			return thiz.attach(p, iterator);
		});
		this.postassemble && this.postassemble();
		if (!oz.parts.length) {
			i -= 1;
			iterator();
		}
	},
	build: function() {
		var oz = this.opts, zcu = zero.core.util;
		if (oz.cubeGeometry) {
			oz.boxGeometry = oz.cubeGeometry;
			this.log("DEPRECATED: cubeGeometry - use boxGeometry!");
		}
		if (oz.boxGeometry) {
			var g = oz.boxGeometry; // better way?
			oz.geometry = new THREE.BoxGeometry(g[0],
				g[1], g[2], g[3], g[4]);
		}
		if (oz.sphereGeometry)
			oz.geometry = new THREE.SphereGeometry();
		if (oz.planeGeometry) {
			var g = oz.planeGeometry; // better way?
			oz.geometry = new THREE.PlaneGeometry(g[0] || 100, g[1] || 100);
		}
		if (oz.geometry || oz.stripset) {
			var meshname = (oz.shader ? "Shader"
				: ("Mesh" + oz.matcat)) + "Material",
				map, meshopts = oz.material;
			if (oz.texture || oz.video) {
				map = oz.texture ? zcu.texture(oz.texture)
					: zcu.videoTexture(oz.video.item || oz.video, this);
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
				(new THREE[oz.loader]()).load(oz.stripset, this.setGeometry);
			else
				this.setGeometry(oz.geometry);
		} else {
			this.setBone();
			this.place();
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
			loader: "JSONLoader",
			geometry: null, // or a THREE.CubeGeometry or something
			matcat: "Phong", // or "Basic"
			meshcat: "Mesh", // or "SkinnedMesh" etc
			material: {}, // color etc
			repeat: null, // or [1, 1] (for instance)
			offset: [0, 0],
			position: [0, 0, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			variants: {},
			mti: {},
			pull: {},
			springs: {},
			aspects: {},
			tickers: {},
			morphs: {},
			state: "solid",
			iterator: null,
			onbuild: null, // also supports: "onassemble", "onremove" ....
			scroll: null,
			shift: null,
			grippy: true,
			frustumCulled: true
		});
		this.variety = this.CLASSNAME.split(".")[2];
		var vl = this.vlower = this.variety.toLowerCase(); // should these be automated by CT.Class?
		this.setName(opts);
		this.pull = opts.pull;
		this.grippy = opts.grippy;
		if ("bone" in opts)
			opts.anchor = opts.bones[opts.bone];
		var thiz = this, iz, name;
		["spring", "aspect", "ticker"].forEach(function(influence) {
			iz = influence + "s", influences = thiz[iz] = {};
			if (vl in zero.base[iz])
				opts[iz] = zero.base[iz][vl]();
			for (name in opts[iz])
				thiz[iz][name] = zero.core[influence + "Controller"].add(opts[iz][name], name, thiz);
		});
		setTimeout(function() {
			thiz.opts.deferBuild || thiz.build();
		}); // next post-init tick
		if (opts.key)
			zero.core.Thing._things[opts.key] = this;
	}
});
zero.core.Thing._things = {};
zero.core.Thing.get = function(key) {
	return zero.core.Thing._things[key];
};