zero.core.Sploder = CT.Class({
	CLASSNAME: "zero.core.Sploder",
	splobits: ["nuts", "bolts", "sparks", "smoke", "dust"],
	flameburst: ["sparks", "smoke", "dust"],
	confetties: ["confetti"],
	sharts: ["shards"],
	degrading: {
		melt: [],
		burn: [],
	},
	degraders: {
		melt: function(thing) {
			var ts = thing.scale();
			ts.y -= 0.01;
			ts.x += 0.01;
			ts.z += 0.01; // TODO: calc pos shift...
			thing.adjust("position", "y", -1, true);
			return ts.y > 0;
		},
		burn: function(thing) {
			var tm = thing.material, burning;
			tm.opacity -= 0.01;
			burning = tm.opacity > 0;
			if (this.fire && !burning) {
				this.fire.quench();
				this._bang(thing.position(), this.flameburst);
			}
			return burning;
		}
	},
	tick: function(dts) {
		for (var v of this.splobits)
			this[v] && this[v].tick(dts);
		this.confetti && this.confetti.tick(dts);
		this.shards && this.shards.tick(dts);
		this.fire && this.fire.tick(dts);
		this.degrade();
	},
	_degrade: function(variety) {
		var i, t, ticker = this.degraders[variety],
			things = this.degrading[variety];
		for (i = things.length - 1; i > -1; i--) {
			t = things[i];
			if (!ticker(t)) {
				CT.data.remove(things, t);
				this.log(t.name, "degraded");
				zero.core.current.room.removeObject(t);
				t._degaud.pause();
				this.tada();
			}
		}
	},
	degrade: function() {
		for (var d in this.degrading)
			this._degrade(d);
	},
	_bang: function(pos, varieties) {
		var oz = this.opts, v;
		pos = pos || zero.core.util.randPos(true);
		for (v of varieties)
			this[v] && this[v].release(oz[v], pos);
	},
	tada: function() {
		zero.core.audio.sfx(this.auds.tada);
	},
	confettize: function(pos) {
		this._bang(pos, this.confetties);
	},
	splode: function(pos, variety) {
		this._bang(pos, this[variety || "splobits"]);
	},
	shart: function(thing, noremove) {
		zero.core.audio.sfx(this.auds.smash);
		this.shards.modMat(thing.material);
		this._bang(thing.position(), this.sharts);
		noremove || zero.core.current.room.removeObject(thing);
		setTimeout(this.tada, 1000);
	},
	melt: function(thing) {
		thing._degaud = zero.core.audio.sfx(this.auds.melt);
		CT.data.append(this.degrading.melt, thing);
	},
	burn: function(thing) {
		thing._degaud = zero.core.audio.sfx(this.auds.burn);
		this.ignite(thing.position());
		CT.data.append(this.degrading.burn, thing);
	},
	ignite: function(pos) {
		if (!this.fire) return;
		this.fire.setPositioners(pos, false, true);
		this.fire.ignite();
	},
	glow: function(thing) {
		var glopts = {
			name: "glow",
			coneGeometry: true,
			geoOpen: true,
			scale: [50, 50, 50],
			vstrip: "templates.one.vstrip.glow",
			material: {
				opacity: 0.6,
				side: THREE.DoubleSide
			}
		}, tr;
		if (thing.body) { // person
			thing = thing.body;
			glopts.position = [0, -100, 0];
			glopts.material.color = "#0096FF";
		}
		tr = thing.rotation();
		glopts.rotation = [Math.PI - tr.x, -tr.y, -tr.z];
		thing.attach(glopts);
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
		oz.fire && pz.push({
			name: "fire",
			thing: "Fire",
			quenched: true
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			nuts: 5,
			bolts: 3,
			dust: 10,
			smoke: 2,
			sparks: 10,
			shards: 10,
			confetti: 30,
			fire: true
		}, this.opts);
		var zc = zero.core, ua = zc.audio.ux.audio;
		this.auds = {
			tada: ua.tada[0],
			smash: ua.smash[0],
			melt: zc.Pool.audio.within[0],
			burn: zc.Fire.audio.crackle[0]
		};
		zero.core.util.ontick(this.tick);
	}
}, zero.core.Thing);