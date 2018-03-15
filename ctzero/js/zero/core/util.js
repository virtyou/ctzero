var lastTime, dmax = dts = 0.032;//0.016;

zero.core.util = {
	ticker: 0,
	coords: function(xyz, cb) {
	    ["x", "y", "z"].forEach(function(dim, i) {
	        cb(dim, xyz[dim] != undefined ? xyz[dim] : xyz[i]);
	    });
	},
	vector: function(p1, p2) { // p2 - p1
		return {
			x: p2.x - p1.x,
			y: p2.y - p1.y,
			z: p2.z - p1.z
		};
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
	init: function(onbuild) {
		zero.core.camera.init();
		var cfg = core.config.ctzero, people = zero.core.util.people = {},
			room = zero.core.util.room = new zero.core.Room(cfg.room), isLast;
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
	},
	animate: function(now) {
	    if (lastTime)
	        dts = Math.min(dmax, (now - lastTime) / 1000);
	    lastTime = now;
	    zero.core.util.ticker += 1;

	    zero.core.springController.tick(dts);
	    zero.core.aspectController.tick();
	    for (var p in zero.core.util.people)
	    	zero.core.util.people[p].tick();

	    zero.core.camera.tick();
	    zero.core.camera.render(); 
	    requestAnimationFrame(zero.core.util.animate);
	},
	person: function(body_generator, name, pos) {
		var body = body_generator();
		if (pos)
			body.position = pos;
		return {
			name: name,
			body: body
		};
	},
	script: function(script) {
		var step = script.shift();
		if (step) zero.core.util.people[step.person].say(step.line, function() {
			setTimeout(zero.core.util.script, step.pause || 0, script);
		});
	},
	frameCount: function() {
		var zcu = zero.core.util;
		if (!zcu._counter)
			zcu._counter = new zero.core.util.FrameCounter();
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
	init: function() {
		this.node = CT.dom.div(null, "abs ctl gigantic bold mosthigh");
		CT.dom.addContent(document.body, this.node);
	}
});