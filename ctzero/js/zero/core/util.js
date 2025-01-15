zero.core.current = {};
zero.core.util = {
	ticker: 0,
	freshtix: 0,
	elapsed: 0,
	relapsed: 0,
	dts: 0.032,
	rdts: 0.032,
	dmax: 0.032,
	dslow: 0.022,
	dperf: 0.016,
	_tickers: [],
	xyz: ["x", "y", "z"],
	_glower: { r: 1, g: 0, b: 0 },
	_distance: new THREE.Vector3(),
	_positioner: new THREE.Vector3(),
	_quatter: new THREE.Quaternion(),
	rates: ["x-slow", "slow", "medium", "fast", "x-fast"],
	pitches: ["x-low", "low", "medium", "high", "x-high"],
	worns: [
		"aura", "pelvis", "lumbar", "ribs", "neck", "head", "finger",
		"hip", "knee", "ankle", "toe", "clavicle", "shoulder", "elbow", "wrist"
	].map(k => "worn_" + k),
	colors: ["red", "green", "blue", "yellow", "brown", "orange", "pink", "gray", "white", "black"],
	randHue: function(family) {
		var zcu = zero.core.util, cz = zcu._colors, i2, lz,
			cstr = "0000", c1, c2, d = CT.data, r = d.random;
		if (family == "pink") {
			var n = r(50) + 50;
			return "#ff" + "" + n + "" + n;
		}
		if (family == "gray") {
			var n = r(40) + 40;
			return "#" + n + "" + n + "" + n;
		}
		if (family == "white")
			return "#f" + r(10) + "f" + r(10) + "f" + r(10);
		if (family == "black")
			return "#" + (10 + r(20)) + "" + (10 + r(20)) + "" + (10 + r(20));
		if (family == "orange")
			return "#ff" + (45 + r(50)) + "00";
		if (family == "yellow")
			return "#" + (80 + r(20)) + "" + (80 + r(20)) + "" + (10 + r(10));
		if (family == "green") // eh........
			return "#" + (20 + r(20)) + "" + (60 + r(20)) + "00";
		if (family == "brown")
			return "#" + (60 + r(20)) + "" + (20 + r(20)) + "00";
		if (!cz) {
			cz = zcu._colors = {};
			lz = ["a", "b", "c", "d", "e", "f"];
			["red", "green", "blue"].forEach(function(c, i) { // eh green....
				i2 = i * 2;
				c1 = cstr.slice(0, i2);
				c2 = cstr.slice(i2);
				cz[c] = lz.map(l => "#" + c1 + l + l + c2);
			});
		}
		return d.choice(cz[family]);
	},
	glow: function(material, timeout) {
		var zcu = zero.core.util;
		if (!material.origColor)
			material.origColor = material.color;
		material.color = zcu._glower;
		setTimeout(() => zcu.unglow(material), timeout || 1000);
	},
	unglow: function(material) {
		material.color = material.origColor;
	},
	randMat: function(color, mcfg) {
		return new THREE.MeshPhongMaterial(CT.merge({
			color: zero.core.util.randHue(color)
		}, mcfg));
	},
	transMat: function() {
		var zcu = zero.core.util;
		if (!zcu.tmat) {
			zcu.tmat = new THREE.MeshBasicMaterial({
				transparent: true,
				opacity: 0
			});
		}
		return zcu.tmat;
	},
	outBound: function(thing, bounder, p, inner) {
		var rb = (bounder || zero.core.current.room)[inner ?
			"innerBounds" : "bounds"], min = rb.min, max = rb.max;
		p = p || thing.position();
		return p.x < min.x || p.x > max.x || p.z < min.z || p.z > max.z;
	},
	randPos: function(objStyle, y, bounder) {
		var r = bounder || zero.core.current.room;
		y = y || 0;
		if (!r.ranges) {
			var p = r.position(null, true),
				bz = r.innerBounds,
				xmin = bz.min.x, zmin = bz.min.z,
				xmax = bz.max.x, zmax = bz.max.z;
				xrange = xmax - xmin, zrange = zmax - zmin,
				xhalf = xrange / 2, zhalf = zrange / 2;
			r.ranges = {
				xrange: xrange,
				zrange: zrange,
				xhalf: xhalf,
				zhalf: zhalf,
				xoff: p.x,
				zoff: p.z
			};
		}
		var rz = r.ranges,
			x = CT.data.random(rz.xrange) - rz.xhalf + rz.xoff,
			z = CT.data.random(rz.zrange) - rz.zhalf + rz.zoff;
		return objStyle ? { x: x, y: y, z: z } : [x, y, z];
	},
	posser: function(pos) {
		var p = zero.core.util._positioner;
		if (pos) {
			p.x = pos.x;
			p.y = pos.y;
			p.z = pos.z;
		}
		return p;
	},
	gear2bone: function(kind, side, sub, part) {
		var zcc = zero.core.current, bone, part,
			p = zcc.person || Object.values(zcc.people)[0],
			bm = p.body.bmap, bms = side && bm[side];
		if (kind == "held")
			bone = bms.arm.wrist;
		else if (kind.startsWith("worn_")) {
			part = part || kind.split("_")[1];
			if (part in bm)
				bone = bm[part];
			else if (bms) {
				bone = sub ? bms[sub][part] : bms[part];
				if (sub == "hand")
					bone = bone[2];
			} else // aura...
				bone = 0; // i guess
		}
		return bone;
	},
	cloneparts: function(parts) {
		return parts.map(function(p) {
			p = CT.merge(p);
			if (p.displacement)
				p.displacement = CT.merge(p.displacement);
			if (p.parts)
				p.parts = zero.core.util.cloneparts(p.parts);
			return p;
		});
	},
	same: function(a, b) {
		if (!a || !b || Object.keys(a).length != Object.keys(b).length)
			return false;
		for (var k in a)
			if (a[k] != b[k])
				return false;
		return true;
	},
	// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
	hex2rgb: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16) / 255,
			g: parseInt(result[2], 16) / 255,
			b: parseInt(result[3], 16) / 255
		} : null;
	},
	hex2int: function(c) {
		return parseInt(c.slice(1), 16);
	},
	int2rgb: function(c) {
		var zcu = zero.core.util,
			h = zcu.componentToHex(c);
		while (h.length < 6)
			h = "0" + h;
		return zcu.hex2rgb("#" + h);
	},
	componentToHex: function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	},
	rgbToHex: function(r, g, b) {
		var c2h = zero.core.util.componentToHex;
		return "#" + c2h(r) + c2h(g) + c2h(b);
	},
	coords: function(xyz, cb) {
		var i, dim, val, zz = zero.core.util.xyz;
		for (i = 0; i < zz.length; i++) {
			dim = zz[i];
			val = xyz[dim] != undefined ? xyz[dim] : xyz[i];
			val != undefined && cb(dim, val);
		}
	},
	update: function(xyza, xyzb) {
		zero.core.util.coords(xyza, function(dim, val) {
			xyzb[dim] = val;
		});
	},
	dimsum: function() {
		var i, coords, sum = arguments[0] || { x: 0, y: 0, z: 0 };
		for (i = 1; i < arguments.length; i++) {
			coords = arguments[i];
			coords && zero.core.util.coords(coords, function(dim, val) {
				sum[dim] += val;
			});
		}
		return sum;
	},
	buff: function(t1, t2, extra, forceRadii, noY) {
		var r1, r2;
		extra = extra || 0;
		if (forceRadii) {
			t1.radii || t1.getBounds();
			t2.radii || t2.getBounds();
		}
		if (!t1.radii || !t2.radii) return extra;
		if (noY) {
			r1 = (t1.radii.x + t1.radii.z) / 2;
			r2 = (t2.radii.x + t2.radii.z) / 2;
		} else {
			r1 = (t1.radii.x + t1.radii.y + t1.radii.z) / 3;
			r2 = (t2.radii.x + t2.radii.y + t2.radii.z) / 3;
		}
		return r1 + r2 + extra;
	},
	touching: function(t1, t2, extra, forceRadii, glopo, noY) {
		if (!t1.isReady() || !t2.isReady())
			return;
		var zcu = zero.core.util, buff = zcu.buff(t1, t2, extra, forceRadii, noY),
			dist = zcu.distance(t1.position(null, glopo), t2.position(null, glopo));
		return dist < buff;
	},
	distance: function(p1, p2) {
		var vec = zero.core.util.vector(p1, p2, true),
			xyzt = (vec.x * vec.x) + (vec.y * vec.y) + (vec.z * vec.z);
		return Math.sqrt(xyzt);
	},
	closest: function(pos, items) {
		var item, dist, shortest, best, distance = zero.core.util.distance;
		for (item of items) {
			dist = distance(pos, item.position());
			if (!best || dist < shortest) {
				best = item;
				shortest = dist;
			}
		}
		return best;
	},
	close2u: function(thingo) {
		var zcc = zero.core.current, r = zcc.room, you = zcc.person;
		if (!you) return 1;
		var diameter = r.getBounds().min.distanceTo(r.bounds.max),
			dist = thingo.position().distanceTo(you.body.position());
		return Math.max(0.001, 1 - dist / diameter); // <0 bounding error?
	},
	getPos: function(thring, world) { // for bones and such
		if (!world)
			return thring.position;
		if (!thring._positioner)
			thring._positioner = new THREE.Vector3();
		return thring.getWorldPosition(thring._positioner);
	},
	freeBod: function(bod) {
		var r = zero.core.current.room, peak,
			pos = bod.position(), radii = bod.radii;
		if (!r.getSolid(pos, radii, true))
			return CT.log("freeBod - already free!");
		peak = r.getPeak(pos, radii, true) + 100; // shouldn't be necessary...
		CT.log("freeBod - upshifting to " + peak);
		bod.adjust("position", "y", peak);
	},
	mult: function(vec, factor) {
		vec.x *= factor;
		vec.y *= factor;
		vec.z *= factor;
	},
	vmult: function(v1, v2, vec) {
		if (!vec) {
			CT.log("creating vec!");
			vec = {};
		}
		vec.x = v1.x * v2.x;
		vec.y = v1.y * v2.y;
		vec.z = v1.z * v2.z;
		return vec;
	},
	invert: function(vec) {
		zero.core.util.mult(vec, -1);
	},
	d2g: function(dz) {
		return new THREE.BoxGeometry(dz[0], dz[1], dz[2], dz[3], dz[4]); // ugh
	},
	vec: function(xyz, objStyle) {
		CT.log("creating vec!");
		return new THREE.Vector3(objStyle ? xyz.x : xyz[0],
			objStyle ? xyz.y : xyz[1], objStyle ? xyz.z : xyz[2]);
	},
	vector: function(p1, p2, vec) { // p2 - p1
		if (!vec) {
			CT.log("creating vec!");
			vec = {};
		} else if (vec === true)
			vec = zero.core.util._distance;
		vec.x = p2.x - p1.x;
		vec.y = p2.y - p1.y;
		vec.z = p2.z - p1.z;
		return vec;
	},
	velocity: function(p1, p2, dt, vec) {
		var dim;
		vec = zero.core.util.vector(p1, p2, vec);
		for (dim in vec)
			vec[dim] = vec[dim] / dt;
		return vec;
	},
	_directors: {
		front: [0, 0, 0],
		back: [0, Math.PI, 0],
		left: [0, Math.PI / 2, 0],
		right: [0, -Math.PI / 2, 0]
	},
	directorize: function(parts) {
		var dirs = zero.core.util._directors;
		parts = parts || [];
		Object.keys(dirs).forEach(function(d) {
			parts.push({
				name: d,
				kind: "director",
				rotation: dirs[d]
			});
		});
		return parts;
	},
	charDir: function(name, side) {
		var zcc = zero.core.current,
			per = name ? zcc.people[name] : zcc.person;
		return per.body[side || "front"].getDirection();
	},
	fit: function(thing, scale) {
		var bz = thing.getBounds(), shortest = Math.min.apply(null,
			Object.values(thing.radii)), ratio = (scale || 1) / shortest;
		thing.xyz(function(axis) {
			thing.adjust("scale", axis, ratio, false, thing.thring);
			thing.opts.centered && thing.adjust("position", axis,
				-ratio * (bz.min[axis] + bz.max[axis]) / 2, false, thing.thring);
		});
	},
	mergeBit: function(obj1, obj2, nval) {
		for (var k in obj1) {
			if (typeof obj1[k] == "number")
				obj2[k] = nval || 0;
			else {
				obj2[k] = {};
				zero.core.util.mergeBit(obj1[k], obj2[k], nval);
			}
		}
	},
	b64toBlob: function(b64Data, contentType, sliceSize) {
		// from: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
		contentType = contentType || '';
		sliceSize = sliceSize || 512;
		var byteCharacters = atob(b64Data);
		var byteArrays = [];
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++)
				byteNumbers[i] = slice.charCodeAt(i);
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		var blob = new Blob(byteArrays, {type: contentType});
		return blob;
	},
	singer: function(cbox, saycb, buttName) {
		var zcu = zero.core.util;
		saycb = saycb || function(song) {
			cbox.value = song;
		};
		return CT.dom.button(buttName || "sing", function(e) {
			if (!cbox.value) return;
			var words = cbox.value.split(" "),
				i, durs = [];
			for (i = 1; i <= 5; i++)
				durs.push(i * 80 + "px");
			var prosodize = function(word, pitchIndex, parentWidth) {
				return "<prosody pitch='"
					+ zcu.pitches[4 - pitchIndex]
					+ "' rate='"
					+ zcu.rates[4 - durs.indexOf(parentWidth)]
					+ "'>" + word + "</prosody>";
			};
			CT.modal.prompt({
				style: "draggers",
				data: words.map(w => [
					"", "", w, "", ""
				]),
				colattrs: {
					onwheel: function(e) {
						var col = e.currentTarget,
							cw = col.style.width,
							ci = durs.indexOf(cw),
							dir = e.deltaY < 0 ? 1 : -1,
							ni = Math.max(0, Math.min(4, ci + dir));
						col.style.width = durs[ni];
					}
				},
				colstyle: {
					width: durs[2]
				},
				rower: function(rowname) {
					var cname = "bordered padded margined round";
					if (rowname) cname += " pointer";
					var rnode = CT.dom.div(rowname, cname, null, rowname && {
						onclick: function() {
							zero.core.current.person.say(prosodize(rowname,
								CT.dom.childNum(rnode), rnode.parentNode.style.width));
						}
					});
					return rnode;
				},
				dataer: function(col) {
					return {
						rows: col.data,
						width: col.style.width
					};
				},
				cb: function(wdata) {
					CT.modal.choice({
						prompt: "sing or export song string (for offsite fiddling)?",
						data: ["sing", "export"],
						cb: function(sel) {
							var song = words.map(function(w, i) {
								return prosodize(w, wdata[i].rows.indexOf(w),
									wdata[i].width);
							}).join(" ");
							if (sel == "sing")
								saycb(song);
							else
								CT.modal.modal(CT.dom.textArea(null, song, "w400p h400p"));
						}
					});
				}
			});
			cbox.value = "";
			e.stopPropagation();
		});
	},
	load: function(kind, stripset, cb) {
		var zcu = zero.core.util;
		if (!zcu._loader)
			zcu._loader = new zcu.Loader();
		zcu._loader.load(kind, stripset, cb);
	},
	_txz: {},
	texture: function(path) {
		path = path.item || path;
		var txz = zero.core.util._txz, tx = new THREE.Texture();
		if (core.config.ctzero.media.proxy && path.startsWith("http"))
			path = "/_memcache?action=prox&p2=true&url=" + path;
		if (!txz[path])
			txz[path] = CT.dom.img(path);
		tx.image = txz[path];
		tx.needsUpdate = true;
		return tx;
	},
	texUpOnLoad: function(mat) {
		if (mat.map) {
			if (mat.map.image.complete)
				mat.needsUpdate = true;
			else {
				mat.map.image.onload = function() {
					mat.needsUpdate = true;
				};
			}
		}
	},
	setTexture: function(thing) {
		var opts = thing.opts, zcu = zero.core.util;
		thing.material.map = (opts.texture && zcu.texture(opts.texture))
			|| (opts.video && zcu.videoTexture(opts.video.item || opts.video, thing));
	},
	uptex: function(thing, opts) {
		var zcu = zero.core.util, mat = thing.material, p;
		opts = opts || thing.opts;
		if ("texture" in opts || "video" in opts)
			zcu.setTexture(thing);
		(opts.repeat || opts.offset) && thing.repOff();
		if (opts.material)
			for (p in opts.material)
				mat[p] = opts.material[p];
		zcu.texUpOnLoad(mat)
	},
	components: function(part, parent) {
		var pref, ipref, oz, compz = [];
		for (pref of ["", "texture_", "stripset_"]) {
			oz = part[pref + "owners"];
			if (oz && oz.length) {
				ipref = pref ? ("Asset (" + part.name + " " + pref.slice(0, -1) + ")") : "Thing";
				if (parent)
					ipref = parent + ": " + ipref;
				compz.push({
					identifier: ipref + ": " + part[pref + "name"],
					owners: oz
				});
			}
		}
		part.parts && part.parts.forEach(function(p) {
			compz = compz.concat(zero.core.util.components(p, parent));
		});
		return compz;
	},
	_map: function(pos, variety, pnode) {
		var node = CT.dom.div(null, "full");
		new CT.map[variety || "Map"]({
			node: node,
			center: pos,
			position: pos,
			disableDefaultUI: true
		});
		if (pnode)
			CT.dom.setContent(pnode, node);
		else
			zero.core.util.back(node);
	},
	map: function(pos, node) {
		zero.core.util._map(pos, "Map", node);
	},
	panorama: function(pos, node) {
		zero.core.util._map(pos, "Panorama", node);
	},
	waiters: [],
	playWaiters: function() {
		var w, wz = zero.core.util.waiters;
		for (w of wz)
			w.play().catch(CT.log);
		wz.length = 0;
	},
	playMedia: function(player, nowaiter) {
		var zcu = zero.core.util;
		if (!zcu.unwaiter)
			zcu.unwaiter = CT.modal.modal("let's get started!",
				zcu.playWaiters, null, true, true);
		player.play().catch(function() {
			if (nowaiter) return CT.log("skipping media playback!");
			zcu.waiters.push(player);
			zcu.unwaiter.show();
		});
	},
	sfx: function(player, fname) {
		if (player.src.endsWith(fname)) // avoids redownloading file(?)
			player.currentTime = 0;
		else
			player.src = fname;
		player.paused && zero.core.util.playMedia(player, true);
	},
	playTrack: function(player, track) {
		var zcc = zero.core.current, d, n;
		player.src = track.item || CT.data.choice(track.items);
		zero.core.util.playMedia(player);
		if (track.owners && track.owners.length) {
			CT.cc.view({
				identifier: "Resource (audio - " + track.kind + "): " + track.name,
				owners: track.owners
			});
		} else if (zcc.adventure) { // vu only! ;)
			[d, n] = track.name.split(": ");
			zcc.adventure.menus.attribution("hearing",
				n, "audio (" + track.kind + ")", d);
		}
	},
	audio: function(src) {
		var a = new Audio(src);
		document.body.appendChild(a);
		a.play();
	},
	vidNode: function(src, className, autoplay) {
		var v = CT.dom.video({
			src: src,
			className: className || "full",
//			autoplay: autoplay
			oncanplay: autoplay && function() {
				zero.core.util.playMedia(v);
			}
		});

		return v;
	},
	video: function(src) {
		var v = zero.core.util.vidNode(src);
		zero.core.util.back(v);
		v.play();
	},
	svids: {},
	videoTexture: function(src, thing) {
		var chan, sup, v, vt, svids = zero.core.util.svids,
			vclass = "w100p transparent notouch below", xo = src.startsWith("http"),
			r = zero.core.current.room, av = r ? r.opts.autovid : true;
		if (src.startsWith("fzn:")) {
			chan = src.slice(4);
			if (chan.startsWith("up:")) {
				sup = "direct";
				chan = chan.slice(3);
			}
			if (!svids[chan]) {
				CT.require("CT.stream", true); // just in case
				svids[chan] = CT.stream.util.fzn.video(chan, vclass, function() {
					CT.log("FZN Video Update");
					thing.update({ video: src });
				}, sup);
			}
			v = svids[chan].video;
		} else {
			if (src.startsWith("tlchan:")) {
				CT.require("CT.stream", true); // just in case
				CT.stream.util.tl.rand(src.slice(7), function(r) {
					CT.event.emit("program", {
						data: r,
						program: "video",
						name: thing.opts.comp
					});
					v.src = r;
					v.play();
				});
				src = null;
			}
			v = zero.core.util.vidNode(src, vclass, av);
			if (xo || !src)
				v.setAttribute('crossorigin', 'anonymous');
			xo && v.play(); // is this right?
			document.body.appendChild(v);
		}
		vt = new THREE.VideoTexture(v);
		v.loop = true;
		v.muted = thing.opts.vidMuted;
		vt.vnode = v;
		vt.zeronode = thing;
		vt.minFilter = vt.magFilter = THREE.NearestFilter; // for power of 2 warnings
		return vt;
	},
	iframe: function(src) {
		zero.core.util.back(CT.dom.iframe(src, "full"));
	},
	background: function(src) {
		zero.core.util.back(null, src);
	},
	getArea: function(cb, filtmap) {
		var a, areas = ["bottom"], r = zero.core.current.room;
		for (a of ["floor", "obstacle"])
			if (r[a])
				areas = areas.concat(Object.keys(r[a]));
		if (filtmap)
			areas = areas.filter(a => !(a in filtmap));
		if (!areas.length)
			return alert("no unoccupied areas!");
		CT.modal.choice({
			prompt: "please select an area",
			data: areas,
			cb: cb
		});
	},
	room: function(robj, retain_lights, nounload) {
		if (zero.core.current.room)
			zero.core.current.room.clear(!robj || retain_lights, !nounload);
		if (robj)
			zero.core.current.room = new zero.core.Room(robj);
		return zero.core.current.room;
	},
	light: function(opts) {
		return zero.core.util.thing(CT.merge(opts, {
			kind: "light",
			thing: "Light",
			variety: "ambient"
		}));
	},
	thing: function(opts, iterator, parent) {
		if (iterator)
			opts.iterator = iterator;
		if (parent)
			opts.scene = parent;
		return new (opts.subclass || zero.core[opts.custom ? "Custom" : (opts.thing || "Thing")])(opts);
	},
	back: function(node, bgsrc, robj) {
		if (!zero.core.util._back) {
			zero.core.util._back = CT.dom.div(null, "full low abs");
			zero.core.camera.container().appendChild(zero.core.util._back);
		}
		CT.dom.setContent(zero.core.util._back, node);
		zero.core.camera.background(bgsrc);
		zero.core.util.room(robj);
	},
	refresh: function(onready, onperson) {
		var cfg = core.config.ctzero, zc = zero.core, people = zc.current.people = {},
			zcu = zc.util, room = zcu.room(cfg.room), loadCount = 0, isLast;
		if (cfg.people.length) {
			cfg.people.forEach(function(pobj, i) {
				people[pobj.name] = new zc.Person(CT.merge(pobj, {
					onbuild: function(person) {
						loadCount += 1;
						isLast = loadCount == cfg.people.length;
						onperson && onperson(person, room, i, isLast);
						if (isLast) {
							person.watch(null, true);
							onready(person, room, i);
							zcu.freshtix = 0;
						}
					}
				}));
			});
		} else
			room.opts.onbuild = function(room) { onready(null, room); };
	},
	ammoize: function() {
		var zc = zero.core;
		zc.current.room.ammoize();
		zc.util.ammoper();
	},
	ammoper: function() {
		zero.core.util.onCurPer(p => p.body.ammoize());
	},
	init: function(onperson, onbuild) {
		var cfg = core.config.ctzero;
		zero.core.ammo.init();
		zero.core.camera.init();
		zero.core.util.ray = new THREE.Raycaster();
		zero.core.util.downVec = new THREE.Vector3(0, -1, 0);
		zero.core.util.refresh(function(person, room, i) {
			setTimeout(requestAnimationFrame, 0, zero.core.util.animate);
			onbuild && onbuild(person, room, i);
		}, onperson);
		if (cfg.framecount)
			zero.core.util.frameCount(typeof cfg.framecount == "string" && cfg.framecount);
	},
	animate: function(now) {
	    var zcu = zero.core.util, zcc = zero.core.current, dts, rdts, p, t,
	    	throttle = core.config.ctzero.throttle;
	    if (throttle)
	    	setTimeout(() => requestAnimationFrame(zcu.animate), throttle);
	    else
	    	requestAnimationFrame(zcu.animate);
	    if (zcu.now) {
	    	zcu.dt = now - zcu.now;
	    	zcu.rdts = zcu.dt / 1000;
	        zcu.dts = Math.min(zcu.dmax, zcu.rdts);
	        zcu.slow = zcu.dts > zcu.dslow;
	    }
	    dts = zcu.dts;
	    rdts = zcu.rdts;
	    zcu.now = now;
	    zcu.ticker += 1;
	    zcu.freshtix += 1;
	    zcu.elapsed += dts;
	    zcu.relapsed += rdts;
	    zero.core.springController.tick(dts, rdts);
	    zero.core.aspectController.tick();
	    if (zcc.room)
	    	zcc.room.tick(dts, rdts);
	    for (p in zcc.people)
	    	zcc.people[p].tick(dts);
	    for (t of zcu._tickers)
	    	t(dts, rdts);
	    zero.core.ammo.tick(zcu.dt);
	    zero.core.camera.tick();
	    zero.core.camera.render();
	},
	ontick: function(cb) {
		zero.core.util._tickers.push(cb);
	},
	untick: function(cb) {
		CT.data.remove(zero.core.util._tickers, cb);
	},
	tickRate: function() {
		var zcu = zero.core.util;
		return zcu.dperf / zcu.dts;
	},
	shouldSkip: function(hard, rando) {
		return zero.core.util.slow && (hard || CT.data.random(rando || 20));
	},
	_cpcbz: [],
	_crcbz: [],
	roomReady: function() {
		var zcc = zero.core.current;
		return zcc.room && zcc.room.isReady();
	},
	onRoomReady: function(cb) {
		var zcu = zero.core.util;
		zcu.roomReady() ? cb() : zcu._crcbz.push(cb);
	},
	procRoomCbs: function() {
		var cb, zcu = zero.core.util;
		for (cb of zcu._crcbz)
			cb();
		zcu._crcbz.length = 0;
	},
	onCurPer: function(cb) {
		if (zero.core.current.person)
			cb(zero.core.current.person);
		else
			zero.core.util._cpcbz.push(cb);
	},
	setCurPer: function(person, skipcam) {
		zero.core.current.person = person;
		for (var cpcb of zero.core.util._cpcbz)
			cpcb(person);
		zero.core.util._cpcbz.length = 0;
		skipcam || zero.core.camera.angle("polar");
	},
	join: function(pobj, onready, nowatch, lookcam, current) {
		var zcc = zero.core.current;
		if (current && zcc.inventory) {
			pobj.gear = zcc.inventory.gear;
			pobj.bag = zcc.inventory.bag;
		}
		var person = new zero.core.Person(CT.merge(pobj, {
			onbuild: function() {
				zcc.people[pobj.name] = person;
				nowatch || person.watch();
				lookcam && person.look(zero.core.camera);
				current && zero.core.util.setCurPer(person);
				core.config.ctzero.gravity && person.body.boundOnRoom();
				onready && onready(person);
			}
		}));
	},
	person: function(body_generator, name, pos, opts, bopts) {
		var body = CT.merge(body_generator(bopts), bopts);
		if (pos)
			body.position = pos;
		return CT.merge({
			name: name,
			body: body
		}, opts);
	},
	frameCount: function(className) {
		var zcu = zero.core.util;
		if (!zcu._counter)
			zcu._counter = new zero.core.util.FrameCounter(className);
		zcu._counter.on();
		return zcu._counter;
	}
};

zero.core.util.Loader = CT.Class({
	CLASSNAME: "zero.core.util.Loader",
	share: function(kind) {
		return false;//kind == "FBXLoader";
	},
	loader: function(kind) {
		if (!this.loaders[kind])
			this.loaders[kind] = new THREE[kind]();
		return this.loaders[kind];
	},
	load: function(kind, stripset, cb) {
		if (!this.share(kind))
			return this.loader(kind).load(stripset, cb);
		this.log("load", stripset);
		if (this.mods[stripset])
			return this.clone(stripset, cb);
		if (!this.cbs[stripset]) {
			this.cbs[stripset] = [];
			this.loader(kind).load(stripset, mod => this.loaded(stripset, mod));
		}
		this.cbs[stripset].push(cb);
	},
	loaded: function(stripset, mod) {
		this.log("loaded", stripset);
		this.mods[stripset] = mod;
		this.cb(stripset);
	},
	cb: function(stripset) {
		var cb, cbs = this.cbs[stripset];
		this.log("passing to", cbs.length, "cbs");
		for (cb of cbs)
			this.clone(stripset, cb);
	},
	clone: function(stripset, cb) {
		this.log("cloning", stripset);
		cb(this.mods[stripset].clone(true)); // not working :(
//		cb(THREE.SkeletonUtils.clone(this.mods[stripset]));
	},
	init: function() {
		this.cbs = {};
		this.mods = {};
		this.loaders = {};
	}
});

zero.core.util.FrameCounter = CT.Class({
	CLASSNAME: "zero.core.util.FrameCounter",
	on: function() {
		if (this._active) return;
		this._active = true;
		CT.dom.show(this.node);
		this._interval = setInterval(this.tick, 1000);
	},
	off: function() {
		this._active = false;
		CT.dom.hide(this.node);
		clearInterval(this._interval);
	},
	tick: function() {
		if (this.lastTick)
			CT.dom.setContent(this.node, zero.core.util.ticker - this.lastTick);
		this.lastTick = zero.core.util.ticker;
	},
	init: function(className) {
		var cname = "abs ctl gigantic bold mosthigh";
		if (className)
			cname += " " + className;
		this.node = CT.dom.div(null, cname);
		CT.dom.addContent(document.body, this.node);
	}
});