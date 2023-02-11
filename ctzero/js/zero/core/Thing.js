zero.core.Thing = CT.Class({
	CLASSNAME: "zero.core.Thing",
	_: {
		customs: [], // stored here, only tick()ed in Thing subclasses that implement tick()
		ready: false,
		readycbs: [],
		postboundz: [],
		built: function() {
			var thiz = this, _ = this._, cb;
			this.opts.onassemble && this.opts.onassemble();
			this.opts.onbuild && this.opts.onbuild(this);
			this.opts.iterator && this.opts.iterator(this);
			_.ready = true;
			this.opts.onclick && zero.core.click.register(this, function() {
				thiz.opts.onclick(thiz);
			});
			this.opts.scroll && this.scroll();
			this.opts.shift && this.shift();
			this.opts.vstrip && this.vsplay();
			if (this.opts.thringopts)
				this.posRotScale(this.opts.thringopts, this.thring);
			if (this.opts.autoplay)
				this.playPause();
			for (cb of _.readycbs)
				cb();
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
		setRadMid: function() {
			var radii = this.radii, mids = this.mids, bounds = this.bounds;
			["x", "y", "z"].forEach(function(dim) {
				radii[dim] = (bounds.max[dim] - bounds.min[dim]) / 2;
				mids[dim] = (bounds.max[dim] + bounds.min[dim]) / 2;
			});
		},
		setInnerBounds: function() {
			var p = this.position(), bounds = this.bounds,
				inners = this.innerBounds = { min: {}, max: {} };
			["x", "y", "z"].forEach(function(dim) {
				inners.min[dim] = bounds.min[dim] - p[dim];
				inners.max[dim] = bounds.max[dim] - p[dim];
			});
		},
		setBounds: function(bounder) {
			var radii = this.radii = {}, mids = this.mids = {},
				bounds = this.bounds = this.bounds || this.hardbounds || new THREE.Box3();
			this.hardbounds || bounds.setFromObject(bounder || this.group);
			this._.setInnerBounds();
			this._.setRadMid();
		},
		bounder: function(dim, i, min, upspring) {
			var bz, bax = this.bindAxis,
				pz = this.positioners, rz = this.radii,
				sz = this.springs, pname = this._xyz[i];
			if (this.opts.centered)
				pz[pname].max = pz[pname].min = 0;
			else {
				bz = zero.core.current.room.bounds;
				pz[pname].max = bz.max[dim] - rz[dim];
				pz[pname].min = (typeof min == "number" ? min : bz.min[dim]) + rz[dim];
			}
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
			if (!core.config.ctzero.gravity) return false;
			return dim == "y" && this.vlower != "pool" && !this.opts.position[1] &&
				!(["poster", "screen", "stream", "portal", "body"].includes(this.opts.kind));
		}
	},
	_xyz: ["x", "y", "z"],
	xyz: function(cb) {
		this._xyz.forEach(cb);
	},
	isReady: function() {
		return this._.ready;
	},
	onReady: function(cb) {
		if (this.isReady())
			cb();
		else
			this._.readycbs.push(cb);
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
	vmult: 1,
	setVolume: function() {
		if (this._audio)
			this._audio.volume = zero.core.util.close2u(this) * this.vmult;
	},
	setLevel: function(val) {
		this.adjust("position", "y", val);
		if (this.springs.y)
			this.springs.y.target = val;
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
	tickPos: function() {
		var g = this.group;
		if (!g) return;
		var gp = g.position, sz = this.springs;
		for (var axis of this._xyz)
			if (sz[axis])
				gp[axis] = sz[axis].value;
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
	getBounds: function() {
		if (!this.bounds)
			this._.setBounds();
		return this.bounds;
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
		this.onbound && this.onbound(this);
		this._.postboundz.forEach(f => f());
	},
	basicBound: function() { // bare bones
		var r = zero.core.current.room,
			pos = this.group.position,
			oz = this.opts, atop;
		this._.setBounds();
		this.homeY = this.radii.y;
		atop = this.within || r.getSurface(pos, this.radii);
		this.homeY += atop ? atop.getTop(pos) : r.bounds.min.y;
		if (oz.swimming)
			this.homeY += CT.data.random(2 * (atop || r).radii.y);
		if (oz.flying) {
			if (this.within)
				this.homeY -= CT.data.random(atop.radii.y);
			else
				this.homeY += CT.data.random(r.radii.y);
		}
		if (oz.bob)
			this.homeY += oz.bob * Math.PI;
		this.adjust("position", "y", this.homeY);
		this.onbound && this.onbound(this);
		this._.postboundz.forEach(f => f());
	},
	onbounded: function(cb) {
		if (this.bounds)
			cb();
		else
			this._.postboundz.push(cb);
	},
	playSong: function(song, onPlaySong) {
		if (!this._audio) {
			this._audio = CT.dom.audio();
			document.body.appendChild(this._audio);
		}
		zero.core.util.playTrack(this._audio, song);
		this.playing = true; // TODO: probably unset at some point....?
		onPlaySong && onPlaySong(song, this.opts.key);
	},
	playPause: function(onPlaySong) {
		if (this.opts.video && this.material.map) {
			var vnode = this.material.map.vnode;
			if (vnode.paused)
				zero.core.util.playMedia(vnode);
			else
				vnode.pause();
		} else if (this.opts.playlist) {
			CT.modal.choice({
				prompt: "pick a song",
				data: this.opts.playlist,
				cb: (s) => this.playSong(s, onPlaySong)
			});
		}
	},
	unvideo: function() {
		if (this.opts.video && this.material.map)
			this.material.map.vnode.remove();
	},
	unvsplay: function(clearOpts) {
		if (this._.vsplayer) {
			zero.core.util.untick(this._.vsplayer);
			delete this._.vsplayer;
			if (clearOpts)
				this.opts.vstrip = null;
		}
	},
	vsplay: function() {
		var zcu = zero.core.util,
			vs = this.opts.vstrip, thaz = this,
			randoff = CT.data.random(vs.frames),
			mat = this.material, t, max = 128;
		this.unvsplay();
		this._.vsplayer = function() {
			if (!zero.core.camera.visible(thaz)) return;
			t = (zcu.ticker + randoff) % vs.frames;
			mat.map.offset.x = ((t % max) * vs.fwidth) / vs.width;
			mat.map.offset.y = (vs.height - vs.fheight * (1 + Math.floor(t / max))) / vs.height;
		};
		zero.core.util.ontick(this._.vsplayer);
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
	unshift: function(clearOpts) {
		if (this._.shifter) {
			zero.core.util.untick(this._.shifter);
			delete this._.shifter;
			this.setPull(0);
			if (clearOpts)
				this.opts.shift = null;
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
		this.group.lookAt(pos.x, pos.y, pos.z);
	},
	// position(), rotation(), scale(): getters _and_ setters
	position: function(position, world) {
		if (position)
			this.update({ position: position });
		else {
			if (world)
				return this.placer.getWorldPosition(zero.core.util._positioner);
			return this.placer.position;
		}
	},
	rotation: function(rotation, world) {
		if (rotation)
			this.update({ rotation: rotation });
		else {
			if (world) {
				var q = zero.core.util._quatter, e = new THREE.Euler();
				this.placer.getWorldQuaternion(q);
				e.setFromQuaternion(q);
				return e;
			}
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
		var oz = this.opts, thiz = this, cfg = core.config.ctzero;
		this.geojson = json;
		if (this.thring) {
			this.thring.geometry.dispose();
			oz.scene.remove(this.thring);
			delete this.thring;
		}
		this.thring = new THREE[oz.meshcat](geometry, this.material);
		this.thring.frustumCulled = oz.frustumCulled; // should probs usually be default (true)
		this.thring.castShadow = cfg.shadows && oz.castShadow;
		this.thring.receiveShadow = cfg.shadows && oz.receiveShadow;
		this.setBone();
		for (var m in this.opts.mti)
			this.morphTargetInfluences(m, this.opts.mti[m]);
		this.place();
		this.assemble();
	},
	adjust: function(property, dimension, value, additive, thring) {
		if (additive)
			(thring || this.placer)[property][dimension] += value;
		else
			(thring || this.placer)[property][dimension] = value;
	},
	setCoords: function(vals, prop, additive, thring) {
		var adjust = this.adjust;
		if (typeof vals == "number")
			vals = [vals, vals, vals];
		zero.core.util.coords(vals, function(dim, val) {
			adjust(prop, dim, val, additive, thring);
		});
	},
	posRotScale: function(opts, thring, additive) {
		var setCoords = this.setCoords;
		["position", "rotation", "scale"].forEach(function(prop) {
			(prop in opts) && setCoords(opts[prop], prop, additive, thring);
		});
	},
	update: function(opts) {
		var zcu = zero.core.util, mat = this.material,
			hasT = "texture" in opts || "video" in opts || "vstrip" in opts,
			o, setter, full = hasT && !mat;
		full || ["stripset", "geometry", "matcat", "meshcat"].forEach(function(item) {
			full = full || (item in opts);
		});
		this.opts = CT.merge(opts, this.opts);
		if (!this.group) return; // hasn't built yet, just wait
		if (full) return this.build();
		if (opts.vstrip) {
			this._vstrip(opts.vstrip);
			opts = this.opts; // for material stuff below
			this.vsplay();
		}
		if (mat) {
			if (hasT)
				mat.map = (opts.texture && zcu.texture(opts.texture))
					|| (opts.video && zcu.videoTexture(opts.video.item || opts.video, this));
			(opts.repeat || opts.offset) && this.repOff();
			if (opts.material)
				for (var p in opts.material)
					mat[p] = opts.material[p];
			if (mat.map) {
				if (mat.map.image.complete)
					mat.needsUpdate = true;
				else {
					mat.map.image.onload = function() {
						mat.needsUpdate = true;
					};
				}
			}
		}
		this.posRotScale(opts);
	},
	_vstrip: function(vs) {
		var opts = this.opts, max = 16384, total;
		if (typeof vs == "string")
			vs = opts.vstrip = CT.module(vs);
		vs.fwidth = vs.fwidth || 128;
		vs.fheight = vs.fheight || 64;
		opts.texture = vs.texture;
		opts.material.transparent = true;
		if (!vs.width) {
			total = vs.fwidth * vs.frames;
			vs.width = Math.min(max, total);
			vs.height = vs.fheight * Math.ceil(total / vs.width);
		}
		opts.repeat = [vs.fwidth / vs.width, vs.fheight / vs.height];
	},
	getMaterial: function(mopts) {
		var oz = this.opts, mat = this.material || oz.matinstance;
		if (!mat) {
			var material = CT.merge(mopts, oz.material);
			if (oz.texture)
				material.map = zero.core.util.texture(oz.texture);
			mat = new THREE["Mesh" + oz.matcat + "Material"](material);
		}
		return mat;
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
	removables: function() {
		return this.parts;
	},
	remove: function() {
		var oz = this.opts, part,
			remoz = this.removables && this.removables();
		this.log("remove", oz.name);
		this.removed = true;
		(oz.anchor || oz.scene).remove(this.group);
		this.unscroll();
		this.unshift();
		this.unvideo();
		this.unvsplay();
		if (oz.key)
			delete zero.core.Thing._things[oz.key];
		if (remoz)
			for (part of remoz)
				part.remove();
		this.onremove && this.onremove();
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
		var customs = this._.customs, thing = zero.core.util.thing(CT.merge(child, {
			path: this.path,
			bones: this.bones || [],
			bmap: this.bmap || {}
		}), function(tng) {
			tng.isCustom && customs.push(tng); // for tick()ing
			iterator && iterator();
		}, this.group);
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
		this.opts.basicBound && (this.within || zero.core.current.room).bounds && this.basicBound();
		this._.built();
	},
	getGroup: function() {
		this.group = this.group || this.placer;
		return this.group;
	},
	assemble: function() {
		if (this.parts) return; // for rebuild update()....
		if (this.preassemble) { // will manipulate parts[]....
			this.opts.parts = zero.core.util.partsclone(this.opts.parts);
			this.preassemble();
		}
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
	repOff: function(map) {
		var oz = this.opts;
		map = map || this.material.map;
		if (oz.repeat) {
			map.wrapS = map.wrapT = THREE.RepeatWrapping;
			map.repeat.set.apply(map.repeat, oz.repeat);
		}
		map.offset.set.apply(map.offset, oz.offset);
	},
	build: function() {
		var g, oz = this.opts, zcu = zero.core.util;
		if (oz.cubeGeometry) {
			oz.boxGeometry = oz.cubeGeometry;
			this.log("DEPRECATED: cubeGeometry - use boxGeometry!");
		}
		if (oz.boxGeometry) {
			g = oz.boxGeometry; // better way?
			if (g == true)
				g = [1, 1, 1, 1, 1, 1];
			oz.geometry = new THREE.BoxGeometry(g[0],
				g[1], g[2], g[3], g[4], g[5]);
		}
		if (oz.sphereGeometry) {
			g = oz.sphereGeometry;
			if (g == true)
				g = 1;
			oz.geometry = new THREE.SphereGeometry(g,
				oz.sphereSegs, oz.sphereSegs);
		}
		if (oz.torusGeometry) {
			g = oz.torusGeometry;
			if (typeof g == "number")
				oz.geometry = new THREE.TorusGeometry(g, oz.torusTubeRadius);
			else if (Array.isArray(g))
				oz.geometry = new THREE.TorusGeometry(g[0], g[1], g[2], g[3]);
			else
				oz.geometry = new THREE.TorusGeometry();
		}
		if (oz.icosahedronGeometry)
			oz.geometry = new THREE.IcosahedronGeometry();
		if (oz.octahedronGeometry)
			oz.geometry = new THREE.OctahedronGeometry();
		if (oz.torusKnotGeometry) {
			g = oz.torusKnotGeometry;
			if (g == true)
				g = [0.3, 0.1, 64, 16];
			oz.geometry = new THREE.TorusKnotGeometry(g[0], g[1], g[2], g[3]);
		}
		if (oz.coneGeometry) {
			var cgs = (typeof oz.coneGeometry == "number") ? oz.coneGeometry : 1;
			oz.geometry = new THREE.ConeGeometry(cgs, cgs * (oz.geomult || 2));
		}
		if (oz.cylinderGeometry) {
			var cgs = (typeof oz.cylinderGeometry == "number") ? oz.cylinderGeometry : 1;
			oz.geometry = new THREE.CylinderGeometry(cgs, cgs, cgs * (oz.geomult || 2));
		}
		if (oz.circleGeometry) {
			var g = oz.circleGeometry;
			oz.geometry = new THREE.CircleGeometry((typeof g == "number") && g, oz.circleSegs);
		}
		if (oz.planeGeometry) {
			var g = oz.planeGeometry; // better way?
			oz.geometry = new THREE.PlaneGeometry(g[0] || 100, g[1] || 100, g[2], g[3]);
		}
		if (oz.bufferGeometry) {
			oz.geometry = (new THREE.BufferGeometry()).fromGeometry(oz.geometry);
			oz.geometry = THREE.BufferGeometryUtils.mergeVertices(oz.geometry);
		}
		if (oz.geometry || oz.stripset) {
			var meshname = (oz.shader ? "Shader"
				: ("Mesh" + oz.matcat)) + "Material",
				map, meshopts = oz.material;
			if (oz.matinstance)
				this.material = oz.matinstance;
			else {
				if (oz.vstrip) this._vstrip(oz.vstrip);
				if (oz.texture || oz.video) {
					map = oz.texture ? zcu.texture(oz.texture)
						: zcu.videoTexture(oz.video.item || oz.video, this);
					this.repOff(map);
					map.minFilter = THREE[oz.minfilt];
					map.magFilter = THREE[oz.magfilt];
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
			}
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
			minfilt: "NearestFilter",
			magfilt: "NearestFilter",
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
			frustumCulled: true,
			sphereSegs: core.config.ctzero.sphereSegs
		});
		if (opts.template) {
			this.log("loading template:", opts.template);
			var tobj = eval(opts.template);
			if (tobj)
				this.opts = opts = CT.merge(tobj, opts); // right order?
			else
				this.log("can't find template!");
		}
		if (opts.kind == "portal")
			opts.state = "threshold";
		if (CT.info.mobile)
			opts.matcat = "Basic";
		this.variety = this.CLASSNAME.split(".")[2];
		var vl = this.vlower = this.variety.toLowerCase(); // should these be automated by CT.Class?
		this.setName(opts);
		this.pull = opts.pull;
		this.grippy = opts.grippy;
		if ("bone" in opts)
			opts.anchor = opts.bones[opts.bone];
		if (opts.onbound)
			this.onbound = opts.onbound;
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