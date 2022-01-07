zero.core.current = {};
zero.core.util = {
	ticker: 0,
	elapsed: 0,
	relapsed: 0,
	dts: 0.032,
	rdts: 0.032,
	dmax: 0.032,
	dslow: 0.022,
	dperf: 0.016,
	_tickers: [],
	rates: ["x-slow", "slow", "medium", "fast", "x-fast"],
	pitches: ["x-low", "low", "medium", "high", "x-high"],
	worns: [
		"aura", "pelvis", "lumbar", "ribs", "neck", "head", "finger",
		"hip", "knee", "ankle", "toe", "clavicle", "shoulder", "elbow", "wrist"
	].map(k => "worn_" + k),
	randHue: function(family) {
		var zcu = zero.core.util, cz = zcu._colors, i2, lz,
			cstr = "0000", c1, c2, d = CT.data, r = d.random;
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
	randMat: function(color) {
		return new THREE.MeshPhongMaterial({
			color: zero.core.util.randHue(color)
		});
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
					bone = bone[0];
			} else // aura...
				bone = 0; // i guess
		}
		return bone;
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
	    ["x", "y", "z"].forEach(function(dim, i) {
	        var val = xyz[dim] != undefined ? xyz[dim] : xyz[i];
	        val != undefined && cb(dim, val);
	    });
	},
	update: function(xyza, xyzb) {
		zero.core.util.coords(xyza, function(dim, val) {
			xyzb[dim] = val;
		});
	},
	touching: function(t1, t2, extra) {
		var dist = zero.core.util.distance(t1.position(), t2.position()),
			r1 = (t1.radii.x + t1.radii.y + t1.radii.z) / 3,
			r2 = (t2.radii.x + t2.radii.y + t2.radii.z) / 3,
			buff = r1 + r2;
		if (extra) buff += extra;
		return dist < buff;
	},
	distance: function(p1, p2) {
		var vec = zero.core.util.vector(p1, p2),
			xyzt = (vec.x * vec.x) + (vec.y * vec.y) + (vec.z * vec.z);
		return Math.sqrt(xyzt);
	},
	close2u: function(thingo) {
		var r = zero.core.current.room, you = zero.core.current.person,
			diameter = r.bounds.min.distanceTo(r.bounds.max),
			dist = thingo.position().distanceTo(you.body.position());
		return 1 - dist / diameter;
	},
	vector: function(p1, p2) { // p2 - p1
		return {
			x: p2.x - p1.x,
			y: p2.y - p1.y,
			z: p2.z - p1.z
		};
	},
	velocity: function(p1, p2, dt) {
		var dim, vec = zero.core.util.vector(p1, p2);
		for (dim in vec)
			vec[dim] = vec[dim] / dt;
		return vec;
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
	_txz: {},
	texture: function(path) {
		var txz = zero.core.util._txz, tx = new THREE.Texture();
		if (core.config.ctzero.media.proxy && path.startsWith("http"))
			path = "/_memcache?action=prox&p2=true&url=" + path;
		if (!txz[path])
			txz[path] = CT.dom.img(path);
		tx.image = txz[path];
		tx.needsUpdate = true;
		return tx;
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
			w.play();
		wz.length = 0;
	},
	playMedia: function(player) {
		var zcu = zero.core.util;
		if (!zcu.unwaiter)
			zcu.unwaiter = CT.modal.modal("let's get started!",
				zcu.playWaiters, null, true, true);
		player.play().catch(function() {
			zcu.waiters.push(player);
			zcu.unwaiter.show();
		});
	},
	playTrack: function(player, track) {
		var zcc = zero.core.current, d, n;
		player.src = track.item;
		zero.core.util.playMedia(player);
		if (track.owners && track.owners.length) {
			CT.cc.view({
				identifier: "Resource (audio - " + track.kind + "): " + track.name,
				owners: track.owners
			});
		} else if (zcc.adventure) { // vu only! ;)
			[d, n] = name.split(": ");
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
		var chan, v, vt, svids = zero.core.util.svids;
			vclass = "w100p transparent notouch below";
		if (src.startsWith("fzn:")) {
			chan = src.slice(4);
			if (!svids[chan]) {
				CT.require("CT.stream", true); // just in case
				svids[chan] = CT.stream.util.fzn.video(chan, vclass, function() {
					CT.log("FZN Video Update");
					thing.update({ video: src });
				});
				document.body.appendChild(svids[chan].node);
			}
			v = svids[chan].video;
		} else {
			v = zero.core.util.vidNode(src, vclass,
				zero.core.current.room.opts.autovid);
			document.body.appendChild(v);
		}
		vt = new THREE.VideoTexture(v);
		v.loop = true;
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
	room: function(robj, retain_lights) {
		if (zero.core.current.room)
			zero.core.current.room.clear(!robj || retain_lights);
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
		var cfg = core.config.ctzero, people = zero.core.current.people = {},
			room = zero.core.util.room(cfg.room), loadCount = 0, isLast;
		if (cfg.people.length) {
			cfg.people.forEach(function(pobj, i) {
				people[pobj.name] = new zero.core.Person(CT.merge(pobj, {
					onbuild: function(person) {
						loadCount += 1;
						isLast = loadCount == cfg.people.length;
						onperson && onperson(person, room, i, isLast);
						if (isLast) {
							person.watch(null, true);
							onready(person, room, i);
						}
					}
				}));
			});
		} else
			room.opts.onbuild = function(room) { onready(null, room); };
	},
	init: function(onperson, onbuild) {
		var cfg = core.config.ctzero;
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
	    var zcu = zero.core.util, zcc = zero.core.current, dts, rdts, p, t;
	    requestAnimationFrame(zcu.animate);
	    if (zcu.now) {
	    	zcu.rdts = (now - zcu.now) / 1000;
	        zcu.dts = Math.min(zcu.dmax, zcu.rdts);
	        zcu.slow = zcu.dts > zcu.dslow;
	    }
	    dts = zcu.dts;
	    rdts = zcu.rdts;
	    zcu.now = now;
	    zcu.ticker += 1;
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
	onCurPer: function(cb) {
		if (zero.core.current.person)
			cb(zero.core.current.person);
		else
			zero.core.util._cpcbz.push(cb);
	},
	setCurPer: function(person) {
		zero.core.current.person = person;
		for (var cpcb of zero.core.util._cpcbz)
			cpcb(person);
		zero.core.util._cpcbz.length = 0;
	},
	join: function(pobj, onready, nowatch, lookcam, current) {
		var person = new zero.core.Person(CT.merge(pobj, {
			onbuild: function() {
				zero.core.current.people[pobj.name] = person;
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