zero.core.Sploder = CT.Class({
	CLASSNAME: "zero.core.Sploder",
	splobits: ["nuts", "bolts", "sparks", "smoke", "dust"],
	flameburst: ["sparks", "smoke", "dust"],
	confetties: ["confetti"],
	sharts: ["shards"],
	degraders: {
		melt: [],
		burn: [],
	},
	tickers: {
		melt: function(thing) {
			var ts = thing.scale();
			ts.y -= 0.01;
			ts.x += 0.01;
			ts.z += 0.01;
			return ts.y > 0;
		},
		burn: function(thing) {
			var tm = thing.material;
			tm.opacity -= 0.01;
			return tm.opacity > 0;
		}
	},
	tick: function(dts) {
		for (var v of this.splobits)
			this[v] && this[v].tick(dts);
		this.confetti && this.confetti.tick(dts);
		this.shards && this.shards.tick(dts);
		this.degrade();
	},
	_degrade: function(variety) {
		var i, t, ticker = this.tickers[variety],
			things = this.degraders[variety];
		for (i = things.length - 1; i > -1; i--) {
			t = things[i];
			if (!ticker(t)) {
				CT.data.remove(things, t);
				this.log(t.name, "degraded");
				zero.core.current.room.removeObject(t);
			}
		}
	},
	degrade: function() {
		for (var d in this.degraders)
			this._degrade(d);
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
		zero.core.current.room.removeObject(thing);
	},
	melt: function(thing) {
		CT.data.append(this.degraders.melt, thing);
	},
	burn: function(thing) { // TODO: flames!
		this._bang(thing.position(), this.flameburst);
		CT.data.append(this.degraders.burn, thing);
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