zero.core.Curtain = CT.Class({
	CLASSNAME: "zero.core.Curtain",
	preassemble: function() {
		const oz = this.opts, pz = oz.parts;
		pz.push({
			name: "rod",
			cylinderGeometry: oz.rodSize,
			geomult: oz.width / oz.rodSize,
			rotation: [0, 0, Math.PI / 2]
		});
		pz.push({
			garment: this,
			name: "drape",
			frame: "rod",
			thing: "Cloth",
			width: oz.width,
			height: oz.height,
			segLen: oz.segLen,
			texture: oz.texture
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			width: 50,
			height: 100,
			rodSize: 2,
			segLen: 10
		}, this.opts);
	}
}, zero.core.Thing);