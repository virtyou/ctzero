zero.core.Doer = CT.Class({
	CLASSNAME: "zero.core.Doer",
	recliners: {
		lie: function(target) {
			var bod = this.person.body, tp = target.position();
			bod.lying = true;
			bod.adjust("position", "x", tp.x);
			bod.adjust("position", "z", tp.z);
		},
		sit: function(target) {
			var bod = this.person.body, tp = target.position(),
				vec = zero.core.util.vector(bod.position(), tp, true);
			bod.sitting = true;
			bod.springs.orientation.target += Math.PI;
			bod.adjust("position", "x", vec.x * 2 / 3, true);
			bod.adjust("position", "z", vec.z * 2 / 3, true);
		},
		rest: function(target, variety, cb) {
			var per = this.person;
			variety = variety || "lie";
			per.gesture(variety);
			this.recliners[variety](target);
			per.body.radSwap(variety);
			if (per.body.upon == target)
				per.body.group.position.y -= target.radii.y * 2;
			cb && this.timeout(cb);
		},
		recline: function(target, variety, cb, instant) {
			if (typeof target == "string")
				target = zero.core.current.room[target];
			var per = this.person,
				recliner = () => this.recliners.rest(target, variety, cb);
			per.body.onReady(() => instant ? recliner() : per.approach(target, recliner));
		}
	},
	lighters: {
		phrases: {
			nofire: ["i don't see anything to light the torch", "where's the fire?", "i don't see a fire"],
			notorch: ["i don't see a torch", "i'd need a torch", "i need a torch to light that"],
			failed: ["dag nab it", "must be wet", "why won't this light", "almost got it"]
		},
		getTorch: function(cb) {
			var per = this.person, torch = zero.core.current.room.torch;
			if (!torch)
				return per.say(CT.data.choice(this.lighters.phrases.notorch));
			per.get(torch, cb);
		},
		lightTorch: function(cb, nobuff) {
			var per = this.person, lz = this.lighters,
				lightable = zero.core.current.room.getFire(per.body.position(), false, true),
				doLight = () => lz.tryLight(per.holding("torch", true).fire, cb, () => lz.lightTorch(cb, true));
			if (!lightable)
				return per.say(CT.data.choice(lz.phrases.nofire));
			per.approach(lightable, () => lz.leanAnd(doLight), false, false, null, nobuff);
		},
		lightFire: function(lightable, cb, nobuff) {
			var retry = () => this.lighters.lightFire(lightable, cb, true),
				doLight = () => this.lighters.tryLight(lightable, cb, retry);
			this.person.approach(lightable, () => this.lighters.leanAnd(doLight), false, false, null, nobuff);
		},
		leanAnd: function(cb) {
			this.person.body.springs.bow.target = Math.PI / 8;
			this.timeout(cb);
		},
		tryLight: function(lightable, cb, fb) {
			var per = this.person;
			per.thruster.thrust(per.holding("torch"));
			this.timeout(() => this.lighters.checkLight(lightable, cb, fb));
		},
		checkLight: function(lightable, cb, fb) {
			var per = this.person, lz = this.lighters;
			per.thruster.unthrust(per.holding("torch"));
			lightable.quenched ? per.say(CT.data.choice(lz.phrases.failed), fb) : (cb && cb());
		}
	},
	blowers: {
		blow: function(name, cb, wait) {
			var per = this.person, side = per.holding(name);
			per.thruster.drink(side);
			this.timeout(() => this.blowers.unblow(side, cb), wait || 3000);
		},
		unblow: function(side, cb) {
			var per = this.person;
			per.thruster.undrink(side);
			per.watch();
			cb && cb();
		}
	},
	riders: {
		mount: function(mount, cb, instant) {
			var p = this.person, b = p.body;
			instant && b.setPositioners(mount.position(), false, true);
			mount.rider = p;
			b.riding = mount;
			zero.core.camera.angle("behind", null, null, true);
			mount.ambience("walk");
			p.go();
			cb && cb();
			CT.event.emit("mount", mount.name);
		},
		dismount: function(mount) {
			var bod = this.person.body;
			delete bod.riding;
			mount.unmount();
			zero.core.camera.angle("preferred");
			bod.adjust("position", "y", mount.position().y);
		}
	},
	givers: {
		approach: function(item, recip, cb) {
			this.person.chase(recip, () => this.givers.hand(item, recip, cb));
		},
		hand: function(item, recip, cb) {
			var per = this.person, side = per.holding(item);
			per.thruster.thrust(side);
			this.timeout(() => this.givers.check(item, recip, cb));
		},
		check: function(item, recip, cb) {
			this.person.holding(item) ? this.givers.approach(item, recip, cb) : cb();
		}
	},
	give: function(item, recip, cb) {
		var cur = zero.core.current;
		if (typeof recip == "string")
			recip = (recip == "player") ? cur.person : cur.people[recip];
		this.givers.approach(item, recip, cb);
	},
	ride: function(mount, cb, instant) {
		if (typeof mount == "string")
			mount = zero.core.current.room.getMount(mount);
		var domount = () => this.riders.mount(mount, cb, instant),
			mountonready = () => mount.onReady(domount);
		instant ? mountonready() : this.person.chase(mount, mountonready);
	},
	unride: function() {
		var mount = this.person.body.riding;
		mount && this.riders.dismount(mount);
	},
	recline: function(target, variety, cb, instant) {
		this.recliners.recline(target, variety, cb, instant);
	},
	light: function(lightable, cb) {
		if (typeof lightable == "string")
			lightable = zero.core.current.room[lightable];
		var lz = this.lighters, torch = this.person.holding("torch", true),
			lightFire = () => lz.lightFire(lightable, cb),
			lightTorch = () => lz.lightTorch(lightFire);
		if (torch) {
			if (torch.fire.quenched)
				lightTorch();
			else
				lightFire();
		} else
			lz.getTorch(lightTorch);
	},
	blow: function(horn, cb) {
		var per = this.person;
		horn = horn || "horn";
		if (typeof horn == "string")
			horn = per.holding(horn, true) || zero.core.current.room[horn];
		if (!horn)
			return per.say("what horn?");
		var name = horn.name,
			blowHorn = () => this.blowers.blow(name, cb),
			getHorn = () => per.get(horn, blowHorn);
		per.holding(name) ? blowHorn() : getHorn();
	},
	timeout: function(cb, interval) {
		this.timer = setTimeout(cb, interval || 1000);
	},
	stop: function() {
		delete this.person;
		clearTimeout(this.timer);
	},
	init: function(opts) {
		this.opts = opts;
		this.person = opts.person;
	}
});