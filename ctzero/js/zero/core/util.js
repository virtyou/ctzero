var lastTime, dmax = dts = 0.032;//0.016;

zero.core.current = {};
zero.core.util = {
	ticker: 0,
	elapsed: 0,
	_tickers: [],
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
	vector: function(p1, p2) { // p2 - p1
		return {
			x: p2.x - p1.x,
			y: p2.y - p1.y,
			z: p2.z - p1.z
		};
	},
	neutral: function(side, sub, nval) {
		var part, axis, resetz = {}, aspz = zero.base.aspects;
		(side ? [side] : ["left", "right"]).forEach(function(side) {
			resetz[side] = {};
			(sub ? [sub] : ["arm", "hand"]).forEach(function(sub) {
				resetz[side][sub] = {};
				for (part in aspz[sub]) {
					resetz[side][sub][part] = {};
					for (axis in aspz[sub][part])
						resetz[side][sub][part][axis] = nval || 0;
				}
			});
		});
		return resetz;
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
	videoTexture: function(src) {
		var v = CT.dom.video(src, "full transparent notouch below"),
			vt = new THREE.VideoTexture(v);
		document.body.appendChild(v);
		v.loop = true;
		vt.vnode = v;
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
	init: function(onbuild) {
		zero.core.camera.init();
		var cfg = core.config.ctzero, people = zero.core.current.people = {},
			room = zero.core.util.room(cfg.room), isLast;
		if (cfg.people.length) {
			cfg.people.forEach(function(pobj, i) {
				people[pobj.name] = new zero.core.Person(CT.merge(pobj, {
					onbuild: function(person) {
						isLast = i == cfg.people.length - 1;
						if (isLast) {
							person.watch();
							setTimeout(requestAnimationFrame, 0, zero.core.util.animate);
						}
						onbuild && onbuild(person, room, i, isLast);
					}
				}));
			});
		} else {
			setTimeout(requestAnimationFrame, 0, zero.core.util.animate);
			onbuild && onbuild();
		}
		if (cfg.framecount)
			zero.core.util.frameCount(typeof cfg.framecount == "string" && cfg.framecount);
	},
	animate: function(now) {
	    if (lastTime)
	        dts = Math.min(dmax, (now - lastTime) / 1000);
	    lastTime = now;
	    zero.core.util.ticker += 1;
	    zero.core.util.elapsed += dts;

	    zero.core.springController.tick(dts);
	    zero.core.aspectController.tick();
	    if (zero.core.current.room)
	    	zero.core.current.room.tick(dts);
	    for (var p in zero.core.current.people)
	    	zero.core.current.people[p].tick();

	    zero.core.util._tickers.forEach(function(t) { t(dts); });

	    zero.core.camera.tick();
	    zero.core.camera.render(); 
	    requestAnimationFrame(zero.core.util.animate);
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
	script: function(script) {
		var step = script.shift();
		if (step) zero.core.current.people[step.person].say(step.line, function() {
			setTimeout(zero.core.util.script, step.pause || 0, script);
		});
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