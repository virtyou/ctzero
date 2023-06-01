zero.core.knocker = {
	_: {
		throw: function(grabber) { // other half of grabber...
			grabber.sticker.knock(zero.core.util.charDir());
			delete grabber.sticker;
		}
	},
	strikers: {
		hand: function(prey, knocker) {
			prey.knock(zero.core.util.charDir(), 300);
		},
		knocker: function(prey, knocker) {
			prey.knock(zero.core.util.charDir());
		},
		grabber: function(prey, grabber) {
			grabber.sticker = prey;
			prey.stick(grabber.perch);
		}
	},
	log: function(msg) {
		CT.log("knocker: " + msg);
	},
	hit: function(striker, preykinds, hitter, cfg, nohit, onhit, isheld) {
		var zc = zero.core, touching = zc.util.touching, zcc = zc.current,
			men = zcc.room.menagerie, source, sb, pk, p, prey, sfx, hitting;
		for (pk of preykinds) {
			if (men[pk]) {
				source = cfg[pk].source;
				sb = source && zcc.people[source].body;
				for (p in men[pk]) {
					prey = men[p];
					if (touching(striker, prey, 50, isheld, isheld)) {
						hitting = true;
						if (hitter(prey)) {
							prey.repos(sb && sb.position(), true);
							sfx = "splat";
						} else {
							prey.yelp();
							prey.glow();
							onhit && onhit(prey);
						}
					}
				}
			}
		}
		hitting || (nohit && nohit());
		return sfx;
	},
	splat: function(preykinds, onsplat, splatcfg, nosplat) {
		return zero.core.knocker.hit(zero.core.current.person.body,
			preykinds, onsplat, splatcfg, nosplat);
	},
	strike: function(prey, striker) {
		var k = zero.core.knocker, sname = striker.name,
			stype = striker.opts.variety || "knocker";
		if (!sname) {
			stype = "hand";
			sname = striker.opts.side;
		}
		k.log(prey.name + " struck by " + sname + " (" + stype + ")");
		k.strikers[stype](prey, striker);
	},
	knock: function(preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, striker = zc.current.person.held(side, true);
		if (striker.sticker)
			return k._.throw(striker);
		return k.hit(striker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.strike(prey, striker), true);
	}
};