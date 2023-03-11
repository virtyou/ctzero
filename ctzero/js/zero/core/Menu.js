zero.core.Menu = CT.Class({
	CLASSNAME: "zero.core.Menu",
	close: function() {
		this.opts.scene.remove(this.group);
	},
	init: function(opts) {
		opts = this.opts = CT.merge(opts, {
			scene: zero.core.camera.get(),
			depth: 6,
			width: 3,
			height: 3,
			backset: 50,
			resize: 0.25,
			color: 0x00ff00
		}, this.opts);
		var bs = opts.backset * 2 / 3,
			width = camera.width(bs),
			height = camera.height(bs),
			w = width / opts.width,
			h = height / opts.height,
//			cpos = camera.position(),
//			depth = cpos.z - opts.backset,
			offsetX = width / 2;
		opts.cubeGeometry = [width, height, opts.depth];
		opts.material = CT.merge(opts.material, {
			transparent: true,
			color: opts.color,
			alphaTest: 0.2,
			opacity: 0.2
		});
//		opts.position = [cpos.x, cpos.y, depth - opts.depth];
		opts.position = [0, 0, -(opts.backset + opts.depth)];
		opts.parts = opts.items.map(function(part, i) {
			var sel = function() {
				opts.onselect(part);
			},  x = (i % opts.width) * w - offsetX,
				y = Math.floor(i / opts.height) * h;
			return {
				parts: [
					CT.merge({
						position: [x, y, opts.depth],
						scale: [opts.resize, opts.resize, opts.resize],
						onclick: sel
					}, part),
					{
						thing: "Text",
						text: part.name,
						position: [x, y, opts.depth],
						onclick: sel
					}
				]
			};
		});
	}
}, zero.core.Thing);