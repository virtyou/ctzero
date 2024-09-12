zero.core.Item = CT.Class({
	CLASSNAME: "zero.core.Item",
	varieties: ["knocker", "smasher", "grabber", "flamer", "quest"],
	_wreck: function(thing, variety) {
		if (!thing) return;
		var zcc = zero.core.current, sploder = zcc.sploder;
		this.log(variety, thing.name);
		CT.event.emit(variety, thing.name);
		if (sploder)
			sploder[variety](thing);
		else
			zcc.room.removeObject(thing);
	},
	_key: function() {
		return this.opts.key || this.opts.fakeKey;
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
	give: function(targets) {
		var receiver = zero.core.current.receiver,
			recipient = receiver && receiver(this, targets);
		if (recipient) {
			this.unhold();
			recipient.hold(this._key(), recipient.freeHand());
			if (recipient.isYou())
				this.log("you got", this.name);
			else {
				this.log("you gave", this.name, "to", recipient.name);
				CT.event.emit("receive", {
					actor: recipient.name,
					item: this.name
				});
			}
		}
	},
	unhold: function() {
		this.person.unhold(this.hand());
	},
	hand: function() {
		var side, key = this._key(),
			held = this.person.opts.gear.held;
		for (side in held)
			if (held[side] == key)
				return side;
	},
	touch: function(targets) {
		this.quest && this.give(targets);
		this.smasher && this.smash();
		if (this.flamer) {
			this.melt();
			this.burn();
			this.ignite();
		}
	},
	init: function(opts) {
		var tmp = zero.base.items[this.opts.name];
		if (tmp && tmp.parts && opts.parts)
			opts.parts = opts.parts.concat(tmp.parts);
		this.opts = opts = CT.merge(opts, tmp, {
			castShadow: true,
			variety: "knocker"
		}, this.opts);
		this.person = opts.person;
		for (var v of this.varieties)
			this[v] = opts.variety == v;
	}
}, zero.core.Thing);