zero.core.Clutter = CT.Class({
	CLASSNAME: "zero.core.Clutter",
	geos: {
		box: "BoxGeometry",
		cone: "ConeGeometry",
		sphere: "SphereGeometry"
//		cylinder: "CylinderGeometry" // "Faceless geometries are not supported" :'(
	},
	rig: function(p) {
		const oz = this.opts;
		return zero.core.ammo.rigid(oz.mass, p, this.getDims(), null,
			this.getMaterial(), oz.friction, this.getGeopts());
	},
	buildLayer: function(layer) {
		const oz = this.opts, p = this.safePos(),
			rz = oz.rows, cz = oz.cols,
			s = oz.size, s2 = s / 2, y = p.y + s * layer,
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
	getGeopts: function() {
		return CT.merge({
			geo: this.getGeo()
		}, this.opts.geopts);
	},
	getGeo: function() {
		return this.geos[this.opts.geotype] || CT.data.choice(Object.values(this.geos));
	},
	getDims: function() {
		const oz = this.opts, s = oz.size, s4 = s / 4,
			r = () => s4 + CT.data.random(s);
		return oz.ransize && {
			x: r(), y: r(), z: r()
		} || {
			x: s, y: s, z: s
		};
	},
	onready: function() {
		this.material = this.getMaterial();
		zero.core.ammo.onReady(() => setTimeout(this.buildPile, 500)); // meh
	},
	onremove: function() {
		this.pile.forEach(zero.core.ammo.delRigid);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			ransize: false,
			size: 50,
			mass: 1,
			rows: 2,
			cols: 3,
			layers: 2,
			friction: 0,
			geotype: "box" // box|cone|sphere|random
		}, this.opts);
		zero.core.util.ammoize();
	}
}, zero.core.Thing);