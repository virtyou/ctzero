zero.core.Head = CT.Class({
	CLASSNAME: "zero.core.Head",
	updaters: {
		eyes: function() {
			var cpos = (this.person.subject || zero.core.camera).position(null, true);
			this.eyeL.look(cpos);
			this.eyeR.look(cpos);
		},
		mouth: function() {
			var cur = this.currentPhoneme, vis = this._viseme,
				phonemes = zero.core.phonemes,
				t, talking = cur && cur != "pau" && cur !== "sil", changed;
			if (talking != this.talking) {
				changed = true;
				this.talking = this.body.talking = talking;
				for (t in this.tickers)
					this.tickers[t].tick();
				for (t in this.body.tickers)
					this.body.tickers[t].tick();
			} else
				this.talking = this.body.talking = talking;
			(talking || changed) && phonemes.forEach(function(pdata) {
				if (pdata.phones.indexOf(cur) != -1) {
					vis(pdata, "target");
					vis(pdata, "k");
				} else if (pdata.otherwise) {
					vis(pdata.otherwise, "target");
					vis(pdata.otherwise, "k");
				}
			});
		}
	},
	_viseme: function(vdata, vtype) {
		for (var k in vdata[vtype] || {})
			this.springs[k][vtype] = vdata[vtype][k];
	},
	blink: function() {
		var bs = this.springs.blink, bk = this.blink;
		bs.target = 1;
		setTimeout(function() {
			bs.target = 0;
			setTimeout(bk, CT.data.random(3000) + 2000);
		}, CT.data.random(100) + 100);
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		if (!this.isReady()) return;
		this.updaters.eyes();
		this.updaters.mouth();
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function() {
		var p, zc = zero.core;
		for (p in zc.phonemes.forms)
			this.springs[p] = zc.springController.add(zc.phonemes.forms[p], p, this);
		this.opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
		setTimeout(this.blink, 1000);
	}
}, zero.core.Thing);