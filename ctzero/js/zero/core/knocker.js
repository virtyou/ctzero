zero.core.knocker = {
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
	knocker: function(prey, knocker) {
		this.log(prey.name, "knocked by", knocker.name);
		prey.knock(zero.core.current.person.body.front.getDirection());
	},
	knock: function(preykinds, onknock, knockcfg, side) {
		var zc = zero.core, k = zc.knocker, knocker = zc.current.person.held(side, true);
		return k.hit(knocker, preykinds, prey => onknock(prey, side),
			knockcfg, null, prey => k.knocker(prey, knocker), true);
	}
};