zero.core.Thing = CT.Class({
	CLASSNAME: "zero.core.Thing",
	_: {
		customs: [], // stored here, only tick()ed in Thing subclasses that implement tick()
		ready: false,
		readycbs: [],
		preboundz: [],
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
			this.opts.frozen && this.freeze();
			if (this.opts.thringopts)
				this.posRotScale(this.opts.thringopts, this.thring);
			if (this.opts.autoplay)
				this.playPause();
			this.onready && this.onready();
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
			for (dim of zero.core.util.xyz)
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
			zero.core.util.xyz.forEach(function(dim) {
				radii[dim] = (bounds.max[dim] - bounds.min[dim]) / 2;
				mids[dim] = (bounds.max[dim] + bounds.min[dim]) / 2;
			});
		},
		setInnerBounds: function() {
			var oz = this.opts, p = this.position(), inners = this.innerBounds = {
				min: {}, max: {}
			}, bounds = this.bounds, sizeShift = oz.sizeBound && oz.size;
			zero.core.util.xyz.forEach(function(dim) {
				if (sizeShift) {
					bounds.min[dim] -= sizeShift;
					bounds.max[dim] += sizeShift;
				}
				inners.min[dim] = bounds.min[dim] - p[dim];
				inners.max[dim] = bounds.max[dim] - p[dim];
			});
		},
		setBounds: function(bounder) {
			var radii = this.radii = {}, mids = this.mids = {}, bmin, bmax, s, p, pz, rx, rz,
				bounds = this.bounds = this.bounds || this.hardbounds || new THREE.Box3();
			if (this.topDown) {
				pz = this.thring.geometry.parameters;
				bmin = bounds.min;
				bmax = bounds.max;
				s = this.scale();
				p = this.position();
				rx = pz.width * s.x / 2;
				rz = pz.height * s.z / 2;
				bmax.x = p.x + rx;
				bmin.x = p.x - rx;
				bmax.z = p.z + rz;
				bmin.z = p.z - rz;
				bmax.y = p.y;
				bmin.y = zero.core.current.room.bounds.min.y;
			} else if (!this.hardbounds)
				bounds.setFromObject(bounder || this.getBounder());
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
				var lz = this.torso.legs, offer = this._toeOffset = Math.max(this._toeOffset || 0,
					lz.left.foot.offset(), lz.right.foot.offset()), diff = this._yoffset = offer - rz[dim];
//				var offer = -this.bones[0].position.y;
				pz[pname].max += diff;
				pz[pname].min += diff;
			}
			this._.nosnap ? setTimeout(bax, 2000, pname) : bax(pname);
			if (upspring)
				sz[pname].target = sz[pname].value = Math.max(sz[pname].target, pz[pname].min);
			if (this._.shouldMin(pname, dim))
				sz[pname].target = pz[pname].min;
		},
		nomins: ["poster", "screen", "stream", "portal", "body"],
		shouldMin: function(pname, dim) { // fix multifloor-zone portals!
			if (!core.config.ctzero.gravity) return false;
			return dim == "y" && this.vlower != "pool" && !this.opts.position[1] &&
				!(this._.nomins.includes(this.opts.kind));
		},
		checkOver: function(dim, pos, radii) {
			var bz = this.bounds;
			if (!radii)
				return pos[dim] > bz.min[dim] && pos[dim] < bz.max[dim];
			return (pos[dim] + radii[dim]) > bz.min[dim]
				&& (pos[dim] - radii[dim]) < bz.max[dim];
		}
	},
	_PRS: ["position", "rotation", "scale"],
	_matModz: ["map", "color", "shininess", "opacity", "transparent"],
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
	getBounder: function() {
		return this.group;
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
	setPos: function(pos, additive, mult) {
		mult = mult || 1;
		if (additive && !pos)
			pos = this.direction || this.getDirection();
		this.adjust("position", "x", pos.x * mult, additive);
		this.adjust("position", "y", pos.y * mult, additive);
		this.adjust("position", "z", pos.z * mult, additive);
	},
	setPositioners: function(xyz, unbound, snap) {
		var _xyz = this._xyz, sz = this.springs, s, p = this.position();
		zero.core.util.xyz.forEach(function(dim, i) {
			s = sz[_xyz[i]];
			if (s) {
				s.target = xyz[dim];
				if (snap)
					s.value = s.target;
			} else
				p[dim] = xyz[dim];
			if (unbound)
				delete s.bounds;
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
		if (!this.isReady()) return;
		var bz = this.getBounds(), check = this._.checkOver;
		return check("x", pos, radii) && check("z", pos, radii)
			&& (!checkY || check("y", pos, radii));
	},
	getTop: function() {
		return this.bounds.max.y;
	},
	getRadii: function() {
		this.radii || this._.setBounds();
		return this.radii;
	},
	getBounds: function() {
		if (!this.bounds)
			this._.setBounds();
		return this.bounds;
	},
	setBounds: function(rebound, nosnap, toeOff) {
		this._.preboundz.forEach(f => f());
		var xyz = zero.core.util.xyz, thaz = this;
		this._.nosnap = nosnap;
		this.autoRot();
		if (toeOff)
			delete this._toeOffset;
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
	unevenTop: function() {
		return this.shelled || this.vlower == "ramp" || this.vlower == "stairs" || this.shifting("y");
	},
	setHomeY: function(notwithin) {
		var r = zero.core.current.room, pos = this.placer.position, oz = this.opts,
			atop = (!notwithin && this.within) || r.getSurface(pos, this.radii);
		if (this.homeY && (atop == this.upon) && !(atop && atop.unevenTop()))
			return;// this.log("setHomeY() - already set");
		this.upon = atop;
		this.homeY = this.radii.y;
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
	},
	simpleBound: function() { // bound ONLY
		this.log("simpleBound");
		setTimeout(this._.setBounds, 200);
	},
	basicBound: function(toeOff) { // bare bones
		this._.preboundz.forEach(f => f());
		if (toeOff)
			delete this._toeOffset;
		this._.setBounds();
		delete this.homeY;
		this.setHomeY();
		this.onbound && this.onbound(this);
		this._.postboundz.forEach(f => f());
		this.log("basicBound", "homeY", this.homeY);
	},
	onbounded: function(cb) {
		if (this.bounds)
			cb();
		else
			this._.postboundz.push(cb);
	},
	beforebound: function(cb) {
		if (this.bounds) {
			this.log("beforebound: already bounded! (calling cb())");
			cb();
		} else
			this._.preboundz.push(cb);
	},
	freeze: function() {
		var mat = this.material;
		mat.color.r = mat.color.g = 0.5;
		mat.shininess = 300;
		mat.opacity = 0.6;
		mat.transparent = true;
	},
	sfx: function(auds) {
		var zc = zero.core;
		zc.audio.sfx(CT.data.choice(auds), this.vmult * zc.util.close2u(this));
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
		if (this.opts.video && this.material && this.material.map)
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
			if (!mat.map) {
				thaz.log("creating vstrip texture on the fly!");
				if (typeof vs == "string") {
					thaz._vstrip(vs);
					vs = thaz.opts.vstrip;
				}
				zcu.uptex(thaz);
			}
			t = (zcu.ticker + randoff) % vs.frames;
			mat.map.offset.x = ((t % max) * vs.fwidth) / vs.width;
			mat.map.offset.y = (vs.height - vs.fheight * (1 + Math.floor(t / max))) / vs.height;
		};
		zero.core.util.ontick(this._.vsplayer);
	},
	slide: function(kind, dim, val, dur, cb) {
		var zcu = zero.core.util, adjust = this.adjust, pk = this.placer[kind],
			fromVal = pk[dim], diff = val - fromVal, goingUp = diff > 0;
		if (!diff) return this.log("i already slid", kind, dim, "to", val);
		dur = dur || 1000;
		var step = diff * 1000 / dur, overval = function() {
			if (goingUp) {
				if (pk[dim] >= val)
					return true;
			} else if (pk[dim] <= val)
				return true;
		}, stepper = function(dts) {
			adjust(kind, dim, dts * step, true);
			if (overval()) {
				zcu.untick(stepper);
				cb && cb();
			}
		};
		zcu.ontick(stepper);
	},
	slides: function(tars, cb, dur) {
		var kind, dims, dim, slide = this.slide;
		dur = dur || 1000;
		for (kind in tars) {
			dims = tars[kind];
			for (dim in dims)
				slide(kind, dim, dims[dim], dur);
		}
		cb && setTimeout(cb, dur);
	},
	backslide: function(tars, onboth, onfirst, dur, wait, useCur) {
		var kind, dims, dim, kf, bk, bax = {}, bwaiter = function() {
			onboth && onboth();
			onfirst && onfirst();
			setTimeout(bslider, wait || 5000);
		}, frommer = this[useCur ? "placer" : "opts"],
			bslider = () => this.slides(bax, onboth, dur);
		for (kind in tars) {
			dims = tars[kind];
			kf = frommer[kind];
			bk = bax[kind] = {};
			for (dim in dims)
				bk[dim] = kf[useCur ? dim : this._xyz.indexOf(dim)];
		}
		this.slides(tars, bwaiter, dur);
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
		if (this.opts.backwards)
			this.lookAway(pos);
		else
			this.group.lookAt(pos.x, pos.y, pos.z);
	},
	lookAway: function(pos) { // https://www.mrspeaker.net/2013/03/06/opposite-of-lookat/
		var g = this.group, v = new THREE.Vector3();
		v.subVectors(g.position, pos).add(g.position);
		g.lookAt(v);
	},
	drop: function() {
		this.adjust("position", "y", zero.core.current.room.getPeak(this.position(), this.radii));
	},
	safePos: function() {
		if (this.placer)
			return this.position();
		var zpo = zero.core.util._positioner, p = this.opts.position;
		this.xyz(function(dim, i) {
			zpo[dim] = p[i];
		});
		return zpo;
	},
	// position(), rotation(), scale(): getters _and_ setters
	position: function(position, world) {
		if (position)
			this.update({ position: position });
		else {
			if (world) {
				if (!this._positioner)
					this._positioner = new THREE.Vector3();
				return this.placer.getWorldPosition(this._positioner);
			}
			return this.placer.position;
		}
	},
	rotation: function(rotation, world) {
		if (rotation)
			this.update({ rotation: rotation });
		else {
			if (world) {
				var q = zero.core.util._quatter,
					e = this._.euler = this._.euler || new THREE.Euler();
				this.placer.getWorldQuaternion(q);
				e.setFromQuaternion(q);
				return e;
			}
			return this.placer.rotation;
		}
	},
	scale: function(scale, rebound) {
		if (scale) {
			if (typeof scale == "number")
				scale = [scale, scale, scale];
			this.update({ scale: scale });
			rebound && setTimeout(this.basicBound, 100) && setTimeout(this.basicBound, 800);
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
	getDirection: function() {
		if (!this.direction)
			this.direction = new THREE.Vector3();
		this.group.getWorldDirection(this.direction);
		if (this.opts.backwards) {
			this.direction.x *= -1;
			this.direction.y *= -1;
			this.direction.z *= -1;
		}
		return this.direction;
	},
	place: function() {
		var oz = this.opts, p = this.getPlacer();
		this._PRS.forEach(function(prop) {
			var setter = p[prop];
			setter.set.apply(setter, oz[prop]);
		});
	},
	modMat: function(modelMat) {
		for (var k of this._matModz)
			this.material[k] = modelMat[k];
	},
	animate: function(animindex, blend) {
		var mixer = this._.mixer, anim = this.thring.animations[animindex];
		if (!mixer)
			return this.log("no mixer!");
		if (!anim)
			return this.log("bad animation index:", animindex);
		blend || mixer.stopAllAction();
		mixer.clipAction(anim).play();
	},
	anivis: function() {
		if (!this._anivis) {
			for (var kid of this.thring.children)
				if (kid.type == "SkinnedMesh")
					this._anivis = kid;
		}
		return zero.core.camera.visible(this._anivis);
	},
	animix: function(dts) {
		this.anivis() && this._.mixer.update(dts);
	},
	unimix: function() {
		zero.core.util.untick(this.animix);
	},
	setGeometry: function(geometry, materials, json) {
		var oz = this.opts, thiz = this, cfg = core.config.ctzero;
		this.geojson = json;
		if (this.thring) {
			this.thring.geometry.dispose();
			this.thring.parent.remove(this.thring);
			delete this.thring;
		}
		if (oz.loader == "FBXLoader") {
			this.thring = geometry;
			if (this.thring.animations.length) {
				this._.mixer = new THREE.AnimationMixer(this.thring);
				if (oz.timeScale)
					this._.mixer.timeScale = oz.timeScale;
				zero.core.util.ontick(this.animix);
			}
		} else
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
		this._PRS.forEach(function(prop) {
			(prop in opts) && setCoords(opts[prop], prop, additive, thring);
		});
	},
	update: function(opts) {
		var zcu = zero.core.util, mat = this.material,
			full = !mat && ("texture" in opts || "video" in opts || "vstrip" in opts);
		full || ["stripset", "geometry", "planeGeometry", "matcat", "meshcat"].forEach(function(item) {
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
		mat && zcu.uptex(this, opts);
		this.posRotScale(opts);
	},
	_vstrip: function(vs) {
		var opts = this.opts, total;
		if (typeof vs == "string")
			vs = opts.vstrip = CT.module(vs);
		vs.downscale = vs.downscale || 1;
		vs.max = vs.max || (16384 / vs.downscale);
		vs.fwidth = vs.fwidth || (128 / vs.downscale);
		vs.fheight = vs.fheight || (64 / vs.downscale);
		opts.texture = vs.texture;
		if (!opts.material)
			opts.material = {};
		opts.material.transparent = true;
		if (!vs.width) {
			total = vs.fwidth * vs.frames;
			vs.width = Math.min(vs.max, total);
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
	refresh: function() {
		this.removeParts();
		this.parts.length = 0;
		if (this.preassemble) {
			this.opts.parts.length = 0;
			this.preassemble();
		}
		this.opts.parts.forEach(p => this.attach(p));
	},
	removables: function() {
		return this.parts;
	},
	removeParts: function() {
		var part, remoz = this.removables && this.removables();
		if (remoz)
			for (part of remoz)
				part.remove();
	},
	remove: function() {
		var oz = this.opts;
		this.log("remove", oz.name);
		this.removed = true;
		(oz.anchor || oz.scene).remove(this.outerGroup());
		this.unscroll();
		this.unshift();
		this.unvideo();
		this.unvsplay();
		this.unimix();
		if (oz.key)
			delete zero.core.Thing._things[oz.key];
		this.removeParts();
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
		var oz = this.opts, customs = this._.customs, chopts = {
			path: this.path,
			bones: this.bones || [],
			bmap: this.bmap || {},
			sharedmat: oz.sharedmat
		};
		if (oz.sharedmat)
			chopts.matinstance = this.getMaterial();
		var thing = zero.core.util.thing(CT.merge(child, chopts, oz.chweaks[child.name]), function(tng) {
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
	getKind: function(kind, overlapper, justover) {
		var name, zc = zero.core, touching = zc.util.touching;
		overlapper = overlapper || zc.current.person.body;
		if (!this[kind]) return;
		for (name in this[kind])
			if (justover ? this[name].overlaps(overlapper) : touching(overlapper, this[name], 50))
				return this[name];
	},
	getGroup: function() {
		this.group = this.group || this.placer;
		return this.group;
	},
	outerGroup: function() {
		return this.getGroup();
	},
	assemble: function() {
		if (this.parts) return; // for rebuild update()....
		if (this.preassemble) { // will manipulate parts[]....
			this.opts.parts = zero.core.util.cloneparts(this.opts.parts);
			this.preassemble();
		}
		var thiz = this, oz = this.opts, i = 0,
			outer = this.outerGroup(),
			iterator = function() {
				i += 1;
				if (i >= oz.parts.length) {
					if (i == oz.parts.length)
						(oz.anchor || oz.scene).add(outer);
					thiz._.assembled = true;
					thiz.assembled();
				}
			};
		if (oz.invisible)
			this.hide();
		this.thring && this.getGroup().add(this.thring);
		this.parts = oz.parts.map(p => this.attach(p, iterator));
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
	initGeo: function() {
		var g, oz = this.opts, zc = zero.core, zcu = zc.util;
		if (oz.cubeGeometry) {
			oz.boxGeometry = oz.cubeGeometry;
			this.log("DEPRECATED: cubeGeometry - use boxGeometry!");
		}
		if (oz.halfCylinder) {
			g = (typeof oz.halfCylinder == "number") ? oz.halfCylinder : 1;
			oz.cylinderGeometry = [g, g, g * (oz.geomult || 2), oz.geoSegs,
				oz.geoHeightSegs, oz.geoOpen, oz.geoThetaStart, Math.PI];
		}
		if (oz.halfSphere) {
			oz.sphereGeometry = (typeof oz.halfSphere == "number") ? oz.halfSphere : 1;
			oz.geoThetaLength = Math.PI / 2;
		}
		if (oz.boxGeometry) {
			g = oz.boxGeometry; // better way?
			if (g == true)
				g = [1, 1, 1, 1, 1, 1];
			oz.geometry = new THREE.BoxGeometry(g[0],
				g[1], g[2], g[3], g[4], g[5]);
		}
		else if (oz.sphereGeometry) {
			g = oz.sphereGeometry;
			if (g == true)
				g = 1;
			oz.geometry = new THREE.SphereGeometry(g, oz.sphereSegs, oz.sphereSegs,
				oz.geoPhiStart, oz.geoPhiLength, oz.geoThetaStart, oz.geoThetaLength);
		}
		else if (oz.torusGeometry) {
			g = oz.torusGeometry;
			if (typeof g == "number")
				oz.geometry = new THREE.TorusGeometry(g, oz.torusTubeRadius);
			else if (Array.isArray(g))
				oz.geometry = new THREE.TorusGeometry(g[0], g[1], g[2], g[3]);
			else
				oz.geometry = new THREE.TorusGeometry();
		}
		else if (oz.icosahedronGeometry)
			oz.geometry = new THREE.IcosahedronGeometry();
		else if (oz.octahedronGeometry)
			oz.geometry = new THREE.OctahedronGeometry();
		else if (oz.torusKnotGeometry) {
			g = oz.torusKnotGeometry;
			if (g == true)
				g = [0.3, 0.1, 64, 16];
			oz.geometry = new THREE.TorusKnotGeometry(g[0], g[1], g[2], g[3]);
		}
		else if (oz.coneGeometry) {
			g = (typeof oz.coneGeometry == "number") ? oz.coneGeometry : 1;
			oz.geometry = new THREE.ConeGeometry(g, g * (oz.geomult || 2), oz.geoRadialSegs,
				oz.geoHeightSegs, oz.geoOpen, oz.geoThetaStart, oz.geoThetaLength);
		}
		else if (oz.cylinderGeometry) {
			g = oz.cylinderGeometry;
			if (Array.isArray(g))
				oz.geometry = new THREE.CylinderGeometry(g[0],
					g[1], g[2], g[3], g[4], g[5], g[6], g[7]);
			else {
				g = (typeof g == "number") ? g : 1;
				oz.geometry = new THREE.CylinderGeometry(g, g, g * (oz.geomult || 2),
					oz.geoSegs, oz.geoHeightSegs, oz.geoOpen, oz.geoThetaStart, oz.geoThetaLength);
			}
		}
		else if (oz.circleGeometry) {
			g = oz.circleGeometry;
			oz.geometry = new THREE.CircleGeometry((typeof g == "number") && g, oz.circleSegs);
		}
		else if (oz.planeGeometry) {
			g = oz.planeGeometry; // better way?
			oz.geometry = new THREE.PlaneGeometry(g[0] || 100, g[1] || 100, g[2], g[3]);
		}
		else if (oz.tubeGeometry) {
			g = oz.tubeGeometry;
			var curve;
			if (g[0] == "curve4") {
				var ts = oz.tubeSeg || 5;
				g[0] = [
					[0, 0, 0],
					[0, ts, ts],
					[0, ts * 2, ts],
					[0, ts * 3, 0]
				];
			} else if (g[0] == "spring")
				curve = zc.trig.curve(oz.springRadius || 10,
					oz.springVert || 50, oz.springReps || 5);
			curve = curve || new THREE.SplineCurve3(g[0].map(zcu.vec));
			oz.geometry = new THREE.TubeGeometry(curve, g[1], g[2], g[3], g[4]);
		}
		if (oz.bufferGeometry) {
			oz.geometry = (new THREE.BufferGeometry()).fromGeometry(oz.geometry);
			oz.geometry = THREE.BufferGeometryUtils.mergeVertices(oz.geometry);
		}
	},
	build: function() {
		var oz = this.opts, zcu = zero.core.util;
		this.initGeo();
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
				var zcfg = core.config.ctzero;
				if (!oz.noAlphaTest && zcfg.alphaTest && meshopts.transparent && !meshopts.alphaTest) {
					this.log("setting alphaTest");
					meshopts.alphaTest = zcfg.alphaTest;
				}
				this.material = new THREE[meshname](meshopts);
			}
			if (oz.stripset)
				zcu.load(oz.loader, oz.stripset, this.setGeometry);
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
		this.min_opts = opts, zc = zero.core, zcc = zc.current;
		if (opts && opts.template) {
			this.log("loading template:", opts.template);
			var tobj = CT.module(opts.template);
			if (tobj)
				opts = CT.merge(opts, tobj); // right order?
			else
				this.log("can't find template!");
		}
		this.opts = opts = CT.merge(opts, {
			path: null,
			name: "Thing" + Math.floor(Math.random() * 1000),
			scene: zc.camera.scene,
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
			chweaks: {},
			state: "solid",
			iterator: null,
			onbuild: null, // also supports: "onassemble", "onremove" ....
			scroll: null,
			shift: null,
			grippy: true,
			climby: false,
			frustumCulled: true,
			sphereSegs: core.config.ctzero.sphereSegs
		});
		this.isport = opts.kind == "portal";
		this.ischest = opts.variety == "chest";
		opts.lockable = this.isport || this.ischest;
		if (this.isport)
			opts.state = "threshold";
		if (CT.info.mobile)
			opts.matcat = "Basic";
		var cnparts = this.CLASSNAME.split(".");
		this.variety = cnparts.pop();
		var vl = this.vlower = this.variety.toLowerCase(); // should these be automated by CT.Class?
		this.setName(opts);
		this.pull = opts.pull;
		this.grippy = opts.grippy;
		this.climby = opts.climby;
		if ("bone" in opts)
			opts.anchor = opts.bones[opts.bone];
		if (opts.onbound)
			this.onbound = opts.onbound;
		var thiz = this, iz, name;
		["spring", "aspect", "ticker"].forEach(function(influence) {
			iz = influence + "s", influences = thiz[iz] = {};
			if (cnparts.length == 2 && vl in zero.base[iz]) // excludes Fauna.Head...
				opts[iz] = zero.base[iz][vl]();
			for (name in opts[iz])
				thiz[iz][name] = zc[influence + "Controller"].add(opts[iz][name], name, thiz);
		});
		setTimeout(function() {
			thiz.opts.credit && zcc.creditor && zcc.creditor(opts.name, thiz.opts.credit);
			thiz.opts.deferBuild || thiz.build();
		}); // next post-init tick
		if (opts.key || opts.fakeKey)
			zc.Thing._things[opts.key || opts.fakeKey] = this;
	}
});
zero.core.Thing._things = {};
zero.core.Thing.get = function(key) {
	return zero.core.Thing._things[key];
};