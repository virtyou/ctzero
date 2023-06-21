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
		},
		unsmash: function(creature) {
			if (creature._origsy && creature.scale().y == 0.1)
				creature.adjust("scale", "y", creature._origsy);
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
			prey._origsy = prey.scale.y;
			prey.adjust("scale", "y", 0.1);
			setTimeout(() => zero.core.knocker._.unsmash(prey), 2000);
		},
		grabber: function(prey, grabber) {
			grabber.sticker = prey;
			prey.stick(grabber.perch);
		}
	},
	log: function(msg) {
		CT.log("knocker: " + msg);
	},
	hit: function(striker, preykinds, hitter, cfg, nohit, onhit, isheld, glopo) {
		var zc = zero.core, touching = zc.util.touching, zcc = zc.current,
			men = zcc.room.menagerie, source, sb, pk, p, prey, sfx, hitting;
		for (pk of preykinds) {
			if (men[pk]) {
				source = cfg[pk].source;
				sb = source && zcc.people[source].body;
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
	splat: function(preykinds, onsplat, splatcfg, nosplat) {
		return zero.core.knocker.hit(zero.core.current.person.body,
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
		k.log(prey.name + " struck by " + sname + " (" + stype + ")");
		k.strikers[stype](prey, striker);
	},
	kick: function(preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, striker = zc.current.person.body.torso.legs[side].foot;
		return zc.knocker.hit(striker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.strike(prey, striker), false, true);
	},
	knock: function(preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, striker = zc.current.person.held(side, true);
		if (striker.sticker)
			return k._.throw(striker);
		striker.touch();
		return k.hit(striker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.strike(prey, striker), true);
	}
};