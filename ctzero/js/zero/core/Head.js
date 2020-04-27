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

			eyeL.morphTargetInfluences(1, eyeMorph); // what is this morph???
			eyeR.morphTargetInfluences(1, eyeMorph);

			//moves rotation center to correct place on parent --- every time, really? <---- !!!!
//			gR.position([3, 6, 7.22]);
//			gL.position([-3, 6, 7.22]);
			gR.position([3, 6.3, 7.22]);
			gL.position([-3, 6.3, 7.22]);

			// rotates eyes based on bones -- configurize?
			var thiz = this, bonez = this.body.thring.skeleton.bones;
			["y", "x"].forEach(function(dimension) {
				["L", "R"].forEach(function(side) {
					var groupThing = thiz["eyeGroup" + side],
						group = groupThing.group,
						cube = groupThing["cube" + side + "eyeDummy"].thring;
					group.rotation[dimension] = cube.rotation[dimension] - (bonez[2].rotation[dimension] + bonez[1].rotation[dimension] + bonez[0].rotation[dimension]);
				});
			});

			// look at subject or camera
			var cpos = (this.person.subject || zero.core.camera).position(null, true);
			cubeL.look(cpos);
			cubeR.look(cpos);

			// blinking...
	    	var lids = this.body.springs.lids;
			if (this.blinking) {
				lids.target = 1;
				lids.k = 2000;
				return;
			}

			// adjust shake, nod, lids, smileEyes based on eye rotation
			var shake = this.body.springs.shake,
			    nod = this.body.springs.nod,
			    eyeRot = this.eyeGroupL.rotation();
			lids.target = 0; // ????
//			shake.boost = 0.01 * eyeRot.y;
//			nod.boost = 0.01 * eyeRot.x;
			if (eyeRot.x > 0)
				lids.target += 1.2*eyeRot.x;
			else
				this.body.springs.smileEyes.target -= eyeRot.x;

			// blink -- tickerize!?!
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


			return; // lines below make eyes huge....

			var smeye = this.body.aspects.smileEyes;
			if (gR.rotation.x > -0.3 && gR.rotation.x < 0.3)
				smeye.value -= 4 * gR.rotation.x;
			else if (gR.rotation.x <= -0.3)
				smeye.value -= -1.2;
			else
				smeye.value -=1.2;
		},
		mouth: function() {
			var cur = this.currentPhoneme, vis = this._viseme,
				phonemes = zero.core.phonemes,
				t, talking = cur && cur != "pau" && cur !== "sil", changed;
			if (talking != this.talking) {
				changed = true;
				this.talking = this.body.talking = talking;
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
			this.teeth.morphTargetInfluences(1, 0);
			this.tongue.morphTargetInfluences(1, 0);
			for (var shape in phonemes.forms) {
				var morphs = phonemes.forms[shape].morphs;
				if (morphs) {
					for (var m in morphs) {
						var morph = morphs[m];
						this[m].morphTargetInfluences(morph.influence, morph.factor * this.body.springs[shape].value, true, true);
					}
				}
			}

			/// DARKEN TEETH WHEN MOUTH SHUT
			var asps = this.body.aspects, teeth_show_ness = 0.8 * asps.ah.value + 0.4 * asps.w.value
				+ 0.4 * asps.ff.value + 0.5 * asps.ee.value + 0.9 * asps.bigSmile.value;
			this.teeth_top.material.color.r = this.teeth.material.color.r = 0.6 + teeth_show_ness;
			this.teeth_top.material.color.g = this.teeth.material.color.g = 0.5 + teeth_show_ness;
			this.teeth_top.material.color.b = this.teeth.material.color.b = 0.5 + teeth_show_ness;
			if (this.teeth.material.color.r > 0.9)
				this.teeth_top.material.color.r = this.teeth.material.color.r = 0.9;
			if (this.teeth.material.color.g > 0.85)
				this.teeth.material.color.g = this.teeth.material.color.b
					= this.teeth_top.material.color.g = this.teeth_top.material.color.b = 0.85;
		}
	},
	_viseme: function(vdata, vtype) {
		for (var k in vdata[vtype] || {})
			this.body.springs[k][vtype] = vdata[vtype][k];
	},
	blink: function() {
		var thiz = this;
		this.blinking = true;
		setTimeout(function() {
			thiz.blinking = false;
		}, CT.data.random(500) + 500);
	},
	energy: function() {
		return this.person && this.person.energy;
	},
	preassemble: function() {
		// TEMPORARY PREASSAMBLE HACK!!!
		this.opts.parts = [];
		this.opts.parts.push({
			name: "eyeL",
			kind: "eye",
			texture: "/blob/5",
			stripset: "/blob/11",
			anchor: this.bones[5]
		});
		this.opts.parts.push({
			name: "eyeR",
			kind: "eye",
			texture: "/blob/5",
			stripset: "/blob/11",
			anchor: this.bones[6]
		});
	},
	tick: function() {
		if (!this.isReady()) return;
//		this.updaters.eyes();
//		this.updaters.mouth();
		var skeleton = this.thring.skeleton;
		this._.customs.forEach(function(c) { c.tick(skeleton); });
	},
	init: function() {
		var p, zc = zero.core;
		for (p in zc.phonemes.forms)
			this.springs[p] = zc.springController.add(zc.phonemes.forms[p], p, this);
	}
}, zero.core.Thing);