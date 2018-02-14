var lightTicker = 0,
    lastTime, dmax = dts = 0.016;

zero.core.util = {
	coords: function(xyz, cb) {
	    ["x", "y", "z"].forEach(function(dim, i) {
	        cb(dim, xyz[dim] != undefined ? xyz[dim] : xyz[i]);
	    });
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
			room = zero.core.util.room = new zero.core.Room(cfg.room);
		cfg.people.forEach(function(pobj, i) {
			people[pobj.name] = new zero.core.Person(CT.merge(pobj, {
				onbuild: function(person) {
					if (i == cfg.people.length - 1) {
						person.watch();
						requestAnimationFrame(zero.core.util.animate);
					}
					onbuild && onbuild(person, room);
				}
			}));
		});
	},
	animate: function(now) {
	    if (lastTime)
	        dts = Math.min(dmax, (now - lastTime) / 1000);
	    lastTime = now;
	    lightTicker += 0.01;

	    zero.core.springController.tick(dts);
	    zero.core.aspectController.tick();
	    for (var p in zero.core.util.people)
	    	zero.core.util.people[p].tick();

	    zero.core.camera.tick();
	    zero.core.camera.render(); 
	    requestAnimationFrame(zero.core.util.animate);
	}
};