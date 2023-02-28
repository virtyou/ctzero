zero.core.Head = CT.Class({
	CLASSNAME: "zero.core.Head",
	updaters: {
		eyes: function() {
			if (!this.person.subject) return; // disabled auto cam look
			var cpos = this.person.subject.position(null, true);
			this.eyeL.look(cpos);
			this.eyeR.look(cpos);
		},
		mouth: function() {
			var cur = this.currentPhoneme, vis = this._viseme,
				phonemes = zero.core.phonemes, pdata, changed,
				talking = cur && cur != "pau" && cur != "sil",
				shape, morphs, morph, m, t, sval;
			if (talking != this.talking) {
				changed = true;
				this.talking = this.body.talking = talking;
				for (t in this.tickers)
					this.tickers[t].tick();
				for (t in this.body.tickers)
					this.body.tickers[t].tick();
				var side, arms = this.body.torso.arms;
				for (side in arms)
					for (t in arms[side].tickers)
						arms[side].tickers[t].tick();
			} else
				this.talking = this.body.talking = talking;
			if (talking || changed) {
				for (pdata of phonemes) {
					if (pdata.phones.indexOf(cur) != -1) {
						vis(pdata, "target");
						vis(pdata, "k");
					} else if (pdata.otherwise) {
						vis(pdata.otherwise, "target");
						vis(pdata.otherwise, "k");
					}
				}
				this.teeth.morphTargetInfluences(1, 0);
				this.tongue.morphTargetInfluences(1, 0);
				for (shape in phonemes.forms) {
					morphs = phonemes.forms[shape].morphs;
					if (morphs) {
						sval = this.springs[shape].value;
						for (m in morphs) {
							morph = morphs[m];
							this[m].morphTargetInfluences(morph.influence,
								morph.factor * sval, true, true);
						}
					}
				}
			}
		}
	},
	_viseme: function(vdata, vtype) {
		for (var k in vdata[vtype] || {})
			this.springs[k][vtype] = vdata[vtype][k];
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		if (!this.isReady() || !zero.core.camera.visible(this)) return;
		this.updaters.eyes();
		this.updaters.mouth();
		zero.core.morphs.tick(this);
		var skeleton = this.thring.skeleton;
		for (var c of this._.customs)
			c.tick(skeleton);
	},
	init: function() {
		var p, zc = zero.core;
		for (p in zc.phonemes.forms)
			this.springs[p] = zc.springController.add(zc.phonemes.forms[p], p, this);
//		this.opts.frustumCulled = false; // TODO: figure out real problem and fix!!!
	}
}, zero.core.Thing);