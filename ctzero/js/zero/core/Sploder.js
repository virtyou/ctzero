zero.core.Sploder = CT.Class({
	CLASSNAME: "zero.core.Sploder",
	splobits: ["nuts", "bolts", "sparks", "smoke", "dust"],
	confetties: ["confetti"],
	sharts: ["shards"],
	tick: function(dts) {
		for (var v of this.splobits)
			this[v] && this[v].tick(dts);
		this.confetti && this.confetti.tick(dts);
	},
	_bang: function(pos, varieties) {
		var oz = this.opts, v;
		pos = pos || zero.core.util.randPos(true);
		for (v of varieties)
			this[v] && this[v].release(oz[v], pos);
	},
	confettize: function(pos) {
		this._bang(pos, this.confetties);
	},
	splode: function(pos) {
		this._bang(pos, this.splobits);
	},
	shart: function(thing) {
		this.shards.modMat(thing.material);
		this._bang(thing.position(), this.sharts);
	},
	pcfg: function(v) {
		return {
			name: v,
			drip: false,
			kind: "particles",
			thing: "Particles"
		};
	},
	preassemble: function() {
		var v, oz = this.opts, pz = oz.parts;
		for (v of this.splobits)
			oz[v] && pz.push(this.pcfg(v));
		oz.confetti && pz.push(this.pcfg("confetti"));
		oz.shards && pz.push(this.pcfg("shards"));
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			nuts: 5,
			bolts: 3,
			dust: 10,
			smoke: 2,
			sparks: 10,
			shards: 10,
			confetti: 30
		}, this.opts);
		zero.core.util.ontick(this.tick);
	}
}, zero.core.Thing);