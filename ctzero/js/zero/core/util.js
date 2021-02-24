zero.core.current = {};
zero.core.util = {
	ticker: 0,
	elapsed: 0,
	relapsed: 0,
	dts: 0.032,
	rdts: 0.032,
	dmax: 0.032,
	_tickers: [],
	rates: ["x-slow", "slow", "medium", "fast", "x-fast"],
	pitches: ["x-low", "low", "medium", "high", "x-high"],
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
	audio: function(src) {
		var a = new Audio(src);
		document.body.appendChild(a);
		a.play();
	},
	video: function(src) {
		var v = CT.dom.video(src, "full");
		zero.core.util.back(v);
		v.play();
	},
	svids: {},
	videoTexture: function(src, thing) {
		var chan, v, vt, svids = zero.core.util.svids;
			vclass = "full transparent notouch below";
		if (src.startsWith("fzn:")) {
			chan = src.slice(4);
			if (!svids[chan]) {
				CT.require("CT.stream", true); // just in case
				svids[chan] = CT.stream.util.fzn.video(chan, vclass, function() {
					thing.update({ video: src });
				});
				document.body.appendChild(svids[chan].node);
			}
			v = svids[chan].video;
		} else {
			v = CT.dom.video(src, vclass);
			document.body.appendChild(v);
		}
		vt = new THREE.VideoTexture(v);
		v.loop = true;
		vt.vnode = v;
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
						if (i == cfg.people.length - 1) // last in line...
							person.watch(null, true);
						if (isLast) // last to load...
							onready(person, room, i);
					}
				}));
			});
		} else
			room.opts.onbuild = function(room) { onready(null, room); };
	},
	init: function(onperson, onbuild) {
		var cfg = core.config.ctzero;
		zero.core.camera.init();
		zero.core.util.refresh(function(person, room, i) {
			setTimeout(requestAnimationFrame, 0, zero.core.util.animate);
			onbuild && onbuild(person, room, i);
		}, onperson);
		if (cfg.framecount)
			zero.core.util.frameCount(typeof cfg.framecount == "string" && cfg.framecount);
	},
	animate: function(now) {
	    var zcu = zero.core.util, zcc = zero.core.current, dts, rdts, p, t;
	    if (zcu.now) {
	    	zcu.rdts = (now - zcu.now) / 1000;
	        zcu.dts = Math.min(zcu.dmax, zcu.rdts);
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
	    requestAnimationFrame(zcu.animate);
	},
	ontick: function(cb) {
		zero.core.util._tickers.push(cb);
	},
	untick: function(cb) {
		CT.data.remove(zero.core.util._tickers, cb);
	},
	join: function(pobj, onready, nowatch, lookcam, current) {
		var person = new zero.core.Person(CT.merge(pobj, {
			onbuild: function() {
				zero.core.current.people[pobj.name] = person;
				nowatch || person.watch();
				lookcam && person.look(zero.core.camera);
				if (current)
					zero.core.current.person = person;
				core.config.ctzero.room.gravity && person.body.setBounds();
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