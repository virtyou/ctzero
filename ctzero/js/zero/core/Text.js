zero.core.Text = CT.Class({
	CLASSNAME: "zero.core.Text",
	init: function(opts) {
		var noPos = !("position" in opts),
			build = this.build;
		opts = this.opts = CT.merge(opts, {
			size: 1,
			height: 1,
			center: true,
			deferBuild: true,
			font: "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
		}, this.opts);
		if (opts.vertical)
			opts.rotation = [0, 0, Math.PI / 2];
		(new THREE.FontLoader()).load(opts.font, function(font) {
			var geo = opts.geometry = new THREE.TextGeometry(opts.text, {
				size: opts.size,
				height: opts.height,
				font: font
			});
			if (noPos || opts.center) { // TODO: improve!
				geo.computeBoundingBox();
				var hx = -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
				if (noPos) {
					opts.position = [
						hx,
						30,
						0
					];
				} else { // center
					if (opts.vertical)
						opts.position[1] += hx;
					else {
						opts.position[2] -= hx;
						opts.position[1] += 0.5 * (geo.boundingBox.max.y - geo.boundingBox.min.y);
					}
				}
			}
			build();
		});
	}
}, zero.core.Thing);