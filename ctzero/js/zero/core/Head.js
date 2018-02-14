var blinkTicker=0;
var blinkWait=1;
var blinkDuration=0.1;

var lookDown=0;
var lookUp=0;
var lookDown_oncer=0;
var lookDown_oncer2=0;
var lookDownTicker=0;
var lookDown_pause=2;
var lookUp_pause=2;
var lookDown_pause_factor=3;
var lookUp_pause_factor=2;
// TODO: transmute above vars, plus updaters[eyes|spontanimation], to Tickers

zero.core.Head = CT.Class({
	CLASSNAME: "zero.core.Head",
	updaters: {
		eyes: function() {
			var gL = this.eyeGroupL, eyeL = gL.eyeL, cubeL = gL.cubeLeyeDummy,
				gR = this.eyeGroupR, eyeR = gR.eyeR, cubeR = gR.cubeReyeDummy,
				eyeMorph = 0.05 * Math.sin(zero.core.util.ticker / 20);

			eyeL.morph(1, eyeMorph);
			eyeR.morph(1, eyeMorph);

			//moves rotation center to correct place on parent --- every time, really? <---- !!!!
//			gR.position([11.5, 24.5, 28]);
//			gL.position([-11.5, 24.5, 28.6]);
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

			var cpos = camera.position();
			lookDownTarget = { x: cpos.x, y: cpos.y - 90, z: cpos.z };
			lookUpTarget = { x: cpos.x + 100, y: cpos.y + 100, z: cpos.z };

			cubeL.thring.lookAt(cpos);
			cubeR.thring.lookAt(cpos);

			if (lookDown == 1) {
				lookDownTicker += 0.01;
				if (lookDown_oncer == 0) {
					lookDown_pause = lookDown_pause_factor * Math.random();
					lookUp_pause = lookUp_pause_factor * Math.random();
					lookDown_oncer = 1;
					lookDown_oncer2 = 0;
				}
				if (lookDownTicker < lookDown_pause){
					cubeL.thring.lookAt(lookDownTarget);
					cubeR.thring.lookAt(lookDownTarget);
				}
				else if (!(lookDownTicker < (lookDown_pause + lookUp_pause))) {
					lookDown_oncer = 0;
					lookDownTicker = 0;
				}
			}
			else if (lookDown_oncer2 == 0) {
				lookDown_oncer = 0;
				lookDown_oncer2 = 1;
				lookDownTicker = 0
			}
			if (lookUp == 1) {
				cubeL.thring.lookAt(lookUpTarget);
				cubeR.thring.lookAt(lookUpTarget);
			}

			if (gL.rotation.x > -0.2)
				this.springs.lids.target += gL.rotation.x;
			else
				this.springs.lids.target = -0.2;

			var smeye = this.aspects.smile_eye;
			if (gR.rotation.x > -0.3 && gR.rotation.x < 0.3)
				smeye.value -= 4 * gR.rotation.x;
			else if (gR.rotation.x <= -0.3)
				smeye.value -= -1.2;
			else
				smeye.value -=1.2;
		},
		mouth: function() {
			var cur = this.currentPhoneme, vis = this._viseme,
				t, talking = cur != "pau" && cur !== "sil";
			if (talking != this.talking) {
				this.talking = talking;
				for (t in this.tickers)
					this.tickers[t].tick();
			} else
				this.talking = talking;
			phonemes.forEach(function(pdata) {
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
						this[m].morph(morph.influence, morph.factor * this.springs[shape].value, true, true);
					}
				}
			}
		},
		aspects: function() {
			var geo = this.body.thring.geometry, a, i, val, dim,
				vert = geo.vertices[0], dims = ["x", "y", "z"];
			for (i = 0; i < geo.vertices.length * 3; i++) {
				val = base[i];
				for (a in this.aspects)
					val += (morphStack[a][i] - base[i]) * this.aspects[a].value;
				dim = dims[i % 3];
				if (dim == "x")
					vert = geo.vertices[i / 3];
				vert[dim] = val;
			}
			geo.verticesNeedUpdate = true;
		},
		spontanimation: function() { // TODO: use Tickers for this (and top vars)!
			var shake = this.springs.shake,
			    nod = this.springs.nod,
			    lids = this.springs.lids,
			    eyeRot = this.eyeGroupL.rotation();
			lids.target = 0; // ????
			shake.target += 0.01 * eyeRot.y;
			nod.target += 0.01 * eyeRot.x;
			if (eyeRot.x > 0)
				lids.target += eyeRot.x;
			else if (eyeRot.x < 0)
				this.springs.smileEyes.target -= 5 * eyeRot.x;
			else
				lids.target = -0.2;
			blinkTicker += 0.01;
			if (blinkTicker > 0.04)
				lids.k = 220;
			if (blinkTicker > blinkWait && blinkTicker < (blinkWait + blinkDuration)) {
				lids.target = 1; // blink
				lids.k = 2000;
			} else {
				blinkWait = 3 * Math.random();
				blinkDuration = 0.1 * Math.random();
				blinkTicker = 0;
			}
		}
	},
	_viseme: function(vdata, vtype) {
		for (var k in vdata[vtype] || {})
			this.springs[k][vtype] = vdata[vtype][k];
	},
	tick: function() {
		if (!this.isReady()) return;
		this.updaters.eyes();
		this.updaters.mouth();
		this.updaters.aspects();
		this.updaters.spontanimation();
	},
	init: function(opts) {
		for (var p in phonemes.forms)
			this.springs[p] = spring.add(phonemes.forms[p], p);
	}
}, zero.core.Thing);