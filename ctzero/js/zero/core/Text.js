zero.core.Text = CT.Class({
	CLASSNAME: "zero.core.Text",
	init: function(opts) {
		var noPos = !("position" in opts),
			build = this.build;
		opts = this.opts = CT.merge(opts, {
			size: 1,
			height: 1,
			deferBuild: true,
			font: "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
		}, this.opts);
		(new THREE.FontLoader()).load(opts.font, function(font) {
			var geo = opts.geometry = new THREE.TextGeometry(opts.text, {
				size: opts.size,
				height: opts.height,
				font: font
			});
			if (noPos) { // TODO: improve!
				geo.computeBoundingBox();
				opts.position = [
					-0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x),
					30,
					0
				];
			}
			build();
		});
	}
}, zero.core.Thing);