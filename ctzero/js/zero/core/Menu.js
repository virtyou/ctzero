zero.core.Menu = CT.Class({
	CLASSNAME: "zero.core.Menu",
	init: function(opts) {
		opts = this.opts = CT.merge(opts, this.opts, {
			width: 15,
			depth: 20,
			height: 20,
			color: 0x00ff00
		});
		if (!(opts.cubeGeometry || opts.geometry)) {
			opts.cubeGeometry = [opts.width * opts.items.length, opts.height, opts.depth];
			opts.material = CT.merge(opts.material, {
				transparent: true,
				color: opts.color,
				opacity: 0.2
			});
		}
		// TODO: figure out dimensions, position, orientation based on camera
		var offset = opts.width * opts.items.length / 2,
			y = -opts.height / 2;
		opts.parts = opts.items.map(function(part, i) {
			var x = i * opts.width - offset;
			return {
				parts: [
					CT.merge({
						position: [x, 10 + y, 0],
						scale: [0.5, 0.5, 0.5]
					}, part),
					{
						thing: "Text",
						text: part.name,
						position: [x, y, 0]
					}
				]
			};
//			part.scale = [0.5, 0.5, 0.5];
//			part.position = [i * 10, 0, 0];
//			return part;
		});
		opts.onbuild = function() {
			// TODO
			// - set callbacks w/ opts.cb
			// - look at camera
		};
	}
}, zero.core.Thing);