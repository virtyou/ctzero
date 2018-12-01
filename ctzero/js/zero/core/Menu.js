zero.core.Menu = CT.Class({
	CLASSNAME: "zero.core.Menu",
	init: function(opts) {
		opts = this.opts = CT.merge(opts, this.opts, {
			width: 15
		});
		// TODO: figure out dimensions, position, orientation based on camera
		opts.parts = opts.items.map(function(part, i) {
			return {
				parts: [
					CT.merge({
						position: [i * opts.width, 20, 0],
						scale: [0.5, 0.5, 0.5]
					}, part),
					{
						thing: "Text",
						text: part.name,
						position: [i * opts.width, 0, 0]
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