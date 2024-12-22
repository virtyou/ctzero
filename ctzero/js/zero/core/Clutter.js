zero.core.Clutter = CT.Class({
	CLASSNAME: "zero.core.Clutter",
	rig: function(p) {
		const oz = this.opts;
		return zero.core.ammo.rigid(oz.mass, p, {
			x: oz.size, y: oz.size, z: oz.size
		}, null, this.getMaterial());
	},
	buildLayer: function(layer) {
		const oz = this.opts, p = this.safePos(),
			s = oz.size, s2 = s / 2, s5 = s / 5,
			rz = oz.rows, cz = oz.cols, y = p.y + s * layer,
			r0 = p.z - s2 * rz, c0 = p.x - s2 * cz,
			ran = () => s2 - CT.data.random(2 * s2);
		let r, c;
		for (r = 0; r < rz; r++) {
			for (c = 0; c < cz; c++) {
				this.pile.push(this.rig({
					x: c0 + c * s + ran(),
					y: y,
					z: r0 + r * s + ran()
				}));
			}
		}
	},
	buildPile: function() {
		this.pile = [];
		for (let i = 0; i < this.opts.layers; i++)
			this.buildLayer(i);
	},
	onready: function() {
		this.material = this.getMaterial();
		zero.core.ammo.onReady(() => setTimeout(this.buildPile, 500)); // meh
	},
	onremove: function() {
		this.pile.forEach(p => zero.core.camera.scene.remove(p));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			size: 50,
			mass: 1,
			rows: 2,
			cols: 3,
			layers: 2
		}, this.opts);
		zero.core.util.ammoize();
	}
}, zero.core.Thing);