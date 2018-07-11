zero.core.Head = CT.Class({
	CLASSNAME: "zero.core.Head",

	blinkTicker: 0,
	blinkWait: 1,
	blinkDuration: 0.1,

	updaters: {
		eyes: function() { // TODO: Tickerize some of this....
			var gL = this.eyeGroupL, eyeL = gL.eyeL, cubeL = gL.cubeLeyeDummy,
				gR = this.eyeGroupR, eyeR = gR.eyeR, cubeR = gR.cubeReyeDummy,
				eyeMorph = 0.05 * Math.sin(zero.core.util.ticker / 20);

			eyeL.morph(1, eyeMorph);
			eyeR.morph(1, eyeMorph);

			//moves rotation center to correct place on parent --- every time, really? <---- !!!!
			gR.position([3, 6, 7.22]);
			gL.position([-3, 6, 7.22]);

			var thiz = this, bonez = this.body.thring.skeleton.bones;
			["y", "x"].forEach(function(dimension) {
				["L", "R"].forEach(function(side) {
					var groupThing = thiz["eyeGroup" + side],
						group = groupThing.group,
						cube = groupThing["cube" + side + "eyeDummy"].thring;
					group.rotation[dimension] = cube.rotation[dimension] - (bonez[2].rotation[dimension] + bonez[1].rotation[dimension] + bonez[0].rotation[dimension]);
				});
			});

			var cpos = (this.person.subject || camera).position(null, true);
			cubeL.look(cpos);
			cubeR.look(cpos);

			if (gL.rotation.x > -0.2)
				this.body.springs.lids.target += gL.rotation.x;
			else
				this.body.springs.lids.target = -0.2;

			var smeye = this.body.aspects.smile_eye;
			if (gR.rotation.x > -0.3 && gR.rotation.x < 0.3)
				smeye.value -= 4 * gR.rotation.x;
			else if (gR.rotation.x <= -0.3)
				smeye.value -= -1.2;
			else
				smeye.value -=1.2;
		},
		mouth: function() {
			var cur = this.currentPhoneme, vis = this._viseme,
				t, talking = cur != "pau" && cur !== "sil", changed;
			if (talking != this.talking) {
				changed = true;
				this.talking = talking;
				for (t in this.tickers)
					this.tickers[t].tick();
			} else
				this.talking = talking;
			(talking || changed) && phonemes.forEach(function(pdata) {
				if (pdata.phones.indexOf(cur) != -1) {
					vis(pdata, "target");
					vis(pdata, "k");
				} else if (pdata.otherwise) {
					vis(pdata.otherwise, "target");
					vis(pdata.otherwise, "k");
				}
			});
			this.teeth.morph(1, 0);
			this.tongue.morph(1, 0);
			for (var shape in phonemes.forms) {
				var morphs = phonemes.forms[shape].morphs;
				if (morphs) {
					for (var m in morphs) {
						var morph = morphs[m];
						this[m].morph(morph.influence, morph.factor * this.body.springs[shape].value, true, true);
					}
				}
			}
		},
		spontanimation: function() { // TODO: use Tickers or something for this (and top vars)!
			var shake = this.body.springs.shake,
			    nod = this.body.springs.nod,
			    lids = this.body.springs.lids,
			    eyeRot = this.eyeGroupL.rotation();
			lids.target = 0; // ????
			shake.target += 0.01 * eyeRot.y;
			nod.target += 0.01 * eyeRot.x;
			if (eyeRot.x > 0)
				lids.target += eyeRot.x;
			else if (eyeRot.x < 0)
				this.body.springs.smileEyes.target -= 5 * eyeRot.x;
			else
				lids.target = -0.2;
			this.blinkTicker += 0.01;
			if (this.blinkTicker > 0.04)
				lids.k = 220;
			if (this.blinkTicker > this.blinkWait && this.blinkTicker < (this.blinkWait + this.blinkDuration)) {
				lids.target = 1; // blink
				lids.k = 2000;
			} else {
				this.blinkWait = 3 * Math.random();
				this.blinkDuration = 0.1 * Math.random();
				this.blinkTicker = 0;
			}
		}
	},
	_viseme: function(vdata, vtype) {
		for (var k in vdata[vtype] || {})
			this.body.springs[k][vtype] = vdata[vtype][k];
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	tick: function() {
		if (!this.isReady()) return;
		this.updaters.eyes();
		this.updaters.mouth();
		this.updaters.spontanimation();
		var skeleton = this.body.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	}
}, zero.core.Thing);