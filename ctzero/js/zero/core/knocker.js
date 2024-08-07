zero.core.knocker = {
	_: {
		throw: function(grabber) { // other half of grabber...
			var zc = zero.core;
			grabber.sticker.knock(zc.util.charDir(), zc.knocker._.crash);
			delete grabber.sticker;
		},
		crash: function(creature) { // source crash check
			var zc = zero.core, pz = zc.current.people,
				sb = creature.source && pz[creature.source].body;
			sb && sb.oncrash && zc.util.touching(creature,
				sb, 0, false, false, true) && sb.oncrash(creature);
		}
	},
	strikers: {
		hand: function(prey, knocker) {
			prey.knock(zero.core.util.charDir(), null, 300);
		},
		foot: function(prey, knocker) {
			prey.knock(zero.core.util.charDir(), null, 500);
		},
		knocker: function(prey, knocker) {
			var zc = zero.core;
			prey.knock(zc.util.charDir(), zc.knocker._.crash);
		},
		smasher: function(prey, smasher) {
			prey.smash();
		},
		grabber: function(prey, grabber) {
			grabber.sticker = prey;
			prey.stick(grabber.perch);
		}
	},
	log: function(msg) {
		CT.log("knocker: " + msg);
	},
	hit: function(men, striker, preykinds, hitter, cfg, nohit, onhit, isheld, glopo) {
		var zc = zero.core, touching = zc.util.touching, zcc = zc.current,
			source, sp, sb, pk, p, prey, sfx, hitting;
		for (pk of preykinds) {
			if (men[pk]) {
				source = cfg[pk].source;
				sp = source && zcc.people[source];
				sb = sp && sp.body;
				for (p in men[pk]) {
					prey = men[p];
					if (touching(striker, prey, 50, isheld, isheld || glopo)) {
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
	splat: function(men, preykinds, onsplat, splatcfg, nosplat) {
		return zero.core.knocker.hit(men, zero.core.current.person.body,
			preykinds, onsplat, splatcfg, nosplat);
	},
	strike: function(prey, striker) {
		var k = zero.core.knocker, sname = striker.name, stype;
		if (sname == "foot") {
			stype = "foot";
			sname = "kick";
		} else if (!sname) {
			stype = "hand";
			sname = striker.opts.side;
		} else
			stype = striker.opts.variety || "knocker";
		if (stype == "quest")
			stype = "hand";
		k.log(prey.name + " struck by " + sname + " (" + stype + ")");
		k.strikers[stype](prey, striker);
	},
	kick: function(men, preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, striker = zc.current.person.body.torso.legs[side].foot;
		return zc.knocker.hit(men, striker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.strike(prey, striker), false, true);
	},
	knock: function(men, preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, striker = zc.current.person.held(side, true);
		if (striker.sticker)
			return k._.throw(striker);
		striker.touch && striker.touch();
		return k.hit(men, striker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.strike(prey, striker), true);
	}
};