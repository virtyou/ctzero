zero.core.Item = CT.Class({
	CLASSNAME: "zero.core.Item",
	varieties: ["knocker", "smasher", "grabber", "flamer"],
	_: {
		wreck: function(thing, variety) {
			if (!thing) return;
			var zcc = zero.core.current, sploder = zcc.sploder;
			this.log(variety, thing.name);
			if (sploder)
				sploder[variety](thing);
			else
				zcc.room.removeObject(thing);
		}
	},
	smash: function() {
		this._.wreck(zero.core.current.room.getBrittle(this), "shart");
	},
	melt: function() {
		this._.wreck(zero.core.current.room.getFrozen(this), "melt");
	},
	burn: function() {
		this._.wreck(zero.core.current.room.getFlammable(this), "burn");
	},
	init: function(opts) {
		this.opts = opts = CT.merge(zero.base.items[this.opts.name], opts, {
			variety: "knocker"
		}, this.opts);
		for (var v of this.varieties)
			this[v] = opts.variety == v;
	}
}, zero.core.Thing);