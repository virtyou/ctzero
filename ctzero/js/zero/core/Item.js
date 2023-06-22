zero.core.Item = CT.Class({
	CLASSNAME: "zero.core.Item",
	varieties: ["knocker", "smasher", "grabber", "flamer"],
	_wreck: function(thing, variety) {
		if (!thing) return;
		var zcc = zero.core.current, sploder = zcc.sploder;
		this.log(variety, thing.name);
		if (sploder)
			sploder[variety](thing);
		else
			zcc.room.removeObject(thing);
	},
	smash: function() {
		this._wreck(zero.core.current.room.getBrittle(this), "shart");
	},
	melt: function() {
		this.fire.quenched || this._wreck(zero.core.current.room.getFrozen(this), "melt");
	},
	burn: function() {
		this.fire.quenched || this._wreck(zero.core.current.room.getFlammable(this), "burn");
	},
	ignite: function() {
		var other = zero.core.current.room.within(this.position(null, true),
			this.radii, true, "plasma", "state"), f = this.fire;
		if (!other) return;
		if (f.quenched) // ignite self
			other.quenched || f.ignite();
		else // ignite others
			other.quenched && other.ignite();
	},
	touch: function() {
		this.smasher && this.smash();
		if (this.flamer) {
			this.melt();
			this.burn();
			this.ignite();
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(zero.base.items[this.opts.name], opts, {
			variety: "knocker"
		}, this.opts);
		for (var v of this.varieties)
			this[v] = opts.variety == v;
	}
}, zero.core.Thing);