zero.core.Sploder = CT.Class({
	CLASSNAME: "zero.core.Sploder",
	varieties: ["nuts", "bolts", "sparks", "smoke", "dust"],
	tick: function(dts) {
		var v, vz = this.varieties;
		for (v of vz)
			this[v] && this[v].tick(dts);
	},
	splode: function(pos) {
		var v, vz = this.varieties, oz = this.opts;
		pos = pos || zero.core.util.randPos(true);
		for (v of vz)
			this[v] && this[v].release(oz[v], pos);
	},
	pcfg: function(v) {
		var pcfg = {
			name: v,
			drip: false,
			kind: "particles",
			thing: "Particles"
		};
		return pcfg;
	},
	preassemble: function() {
		var v, vz = this.varieties, oz = this.opts, pz = oz.parts;
		for (v of vz)
			oz[v] && pz.push(this.pcfg(v));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			nuts: 5,
			bolts: 3,
			dust: 10,
			smoke: 2,
			sparks: 10
		}, this.opts);
		zero.core.util.ontick(this.tick);
	}
}, zero.core.Thing);