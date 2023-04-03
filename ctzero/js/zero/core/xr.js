zero.core.xr = { // https://01.org/blogs/darktears/2019/rendering-immersive-web-experiences-threejs-webxr
	_: {
		things: ["grip", "targetRay"],
		fings: [
			["pointer"],
			["middle", "ring", "pinkie"]
		],
		rot: new THREE.Euler(),
		eye: function(viewMatrixArray, view, viewport) {
			var _ = zero.core.xr._, rnd = _.renderer,
				scene = camera.scene, cam = camera.get();
			rnd.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
			rnd.render(scene, camera._[view.eye].camera || cam);
			rnd.clearDepth();
		},
		trans: function(space, pos, rot) {
			return space.getOffsetReferenceSpace(new XRRigidTransform(pos, rot));
		},
		perUp: function(orientation) {
			var _ = zero.core.xr._, rot = _.rot.setFromQuaternion(orientation),
				per = zero.core.current.person, pbs = per.body.springs;
			pbs.shake.target = rot.y;
			pbs.nod.target = -rot.x;
//			pbs.tilt.target = rot.z; // TODO: (rig pov cam to rotate)
		},
		butts: {},
		butters: { // for right controller....
			a: function(isPressed) {
				zero.core.camera.angle(isPressed ? "behind" : "pov");
			},
			b: function(isPressed) {
				zero.core.current.controls[isPressed ? "jump": "unjump"]();
			}
		},
		butt: function(butt, isPressed) {
			var _ = zero.core.xr._;
			if (_.butts[butt] == isPressed)
				return;
			_.butts[butt] = isPressed;
			_.butters[butt](isPressed);
		},
		contrUp: function(frame, space) {
			var zc = zero.core, _ = zc.xr._, gp, bz, ax, joying, i, v, xyz,
				c, t, pose, thring, dim, tor, thumb, tp, tf, ab, bb, hand;
			if (!_.controllers) return;
			xyz = zc.util.xyz;
			tor = zc.current.person.body.torso;
			for (c of _.controllers) {
				gp = c.gamepad;
				bz = gp.buttons;
				ax = gp.axes;

				hand = tor.hands[c.handedness];
				hand.curl(bz[0].value * 3 / 2, false, _.fings[0]);
				hand.curl(bz[1].value * 3 / 2, false, _.fings[1]);

				ab = bz[4];
				bb = bz[5];
				thumb = (ab.touched * 0.5) + (bb.touched * 0.5);
				hand.curl(thumb, true);
				if (c.handedness == "right") {
					_.butt("a", ab.pressed);
					_.butt("b", bb.pressed);
				}

				for (i = 0; i < ax.length; i++) {
					v = ax[i];
					if (v) {
						joying = true;
						_.joy(i, v, c);
					}
				}
				joying || _.unjoy();
				for (t of _.things) {
					pose = frame.getPose(c[t + "Space"], space);
					thring = _[t][c.handedness].thring;
					if (!thring || !pose) continue;
					tp = thring.position;
					tf = pose.transform;
					for (dim of xyz)
						tp[dim] = 25 - 50 * tf.position[dim];
					tp.y *= -1;
					tp.y += 20;
					thring.setRotationFromQuaternion(tf.orientation);
					thring.rotation.x *= -1;
					thring.updateMatrixWorld(true);
				}
				_.armsOn && tor.arms[c.handedness].pose(_.grip[c.handedness]);
			}
		},
		contReg: function() {
			var _ = zero.core.xr._, c,
				anchor = zero.core.current.person.body.lookAt.thring;
			_.grip = {};
			_.targetRay = {};
			_.controllers = _.sesh.inputSources;
			CT.log(_.controllers.length + " registered controllers");
			for (c of _.controllers) {
				CT.log(c.handedness + " " + c.gamepad.buttons.length);
				_.grip[c.handedness] = new zero.core.Thing({
					name: c.handedness + "grip",
					scene: anchor,
					boxGeometry: [5, 5, 5],
					material: {
						color: 0xff0000,
						visible: core.config.ctzero.helpers
					}
				});
				_.targetRay[c.handedness] = new zero.core.Thing({
					name: c.handedness + "targetRay",
					scene: anchor,
					boxGeometry: [1, 1, 60],
					material: {
						color: 0x00ff00,
						visible: core.config.ctzero.helpers
					}
				});
			}
		},
		bval: function(controller, cb) {
			var _ = zero.core.xr._, gp = controller.gamepad,
				bz = gp.buttons, b = bz[0];
			cb(b, controller);
		},
		unjoy: function() {
			var _ = zero.core.xr._, pco = zero.core.current.controls;
			if (_.going) {
				_.going = false;
				pco.stop();
			}
			if (_.spinning) {
				_.spinning = false;
				pco.still();
			}
		},
		joy: function(i, v, controller) {
//			CT.log(controller.handedness + " axis " + i + ": " + v);
			var _ = zero.core.xr._, pco = zero.core.current.controls,
				pos = v > 0, abs = Math.abs(v);
			if (i % 2) { // y
				_.going = true;
				pco[pos ? "backward" : "forward"](abs);
			} else { // x
				_.spinning = true;
				pco[pos ? "right" : "left"](abs);
			}
		},
		selectstart: function(b, controller) {
			var hand = controller.handedness;
			CT.log(hand + " DISABLED selectstart (jump) " + b.touched + " " + b.pressed + " " + b.value);
//			if (hand == "left")
//				zero.core.camera.angle("behind");
//			else {
//				var ha = controller.gamepad.hapticActuators;
//				zero.core.current.controls.jump();
//				ha && ha[0].pulse(0.8, 100);
//			}
		},
		selectend: function(b, controller) {
			var hand = controller.handedness;
			CT.log(hand + " DISABLED selectend (unjump) " + b.touched + " " + b.pressed + " " + b.value);
//			if (controller.handedness == "left")
//				zero.core.camera.angle("pov");
//			else
//				zero.core.current.controls.unjump();
		},
		squeezestart: function(b, controller) {
			var pv = b.value * 1000000,
				v = 5 * (pv - 0.5);
			CT.log(controller.handedness + " DISABLED squeezestart (finger curl) " + b.touched + " " + b.pressed + " " + b.value + " " + pv + " " + v);
//			zero.core.current.person.body.torso.hands[controller.handedness].curl(v);
		},
		squeezeend: function(b, controller) {
			CT.log(controller.handedness + " DISABLED squeezeend: (finger uncurl) " + b.touched + " " + b.pressed + " " + b.value);
//			zero.core.current.person.body.torso.hands[controller.handedness].curl(0);
		},
		events: function() {
			var _ = zero.core.xr._, sesh = _.sesh;
			sesh.addEventListener("inputsourceschange", _.contReg);
			sesh.addEventListener("end", () => CT.log("vr session ended"));
			["selectstart", "selectend", "squeezestart", "squeezeend"].forEach((name) => {
				sesh.addEventListener(name, (e) => _.bval(e.inputSource, _[name]));
			});
		}
	},
	tick: function(time, frame) {
		var _ = zero.core.xr._, view, viewport,
			pose = frame.getViewerPose(_.space);
		if (pose) {
			_.perUp(pose.transform.orientation);
			camera.scene.updateMatrixWorld(true);
			for (view of pose.views) {
				viewport = _.sesh.baseLayer.getViewport(view);
				_.eye(pose.viewMatrix, view, viewport);
			}
			_.contrUp(frame, _.space);
		}
		_.sesh.requestAnimationFrame(zero.core.xr.tick);
	},
	launch: function(space) {
		var _ = zero.core.xr._, rnd = _.renderer = new THREE.WebGLRenderer(),
			ctx = rnd.context, scene = camera.scene, bl, side;
		_.space = space;
		ctx.makeXRCompatible().then(function() {
			bl = _.sesh.baseLayer = new XRWebGLLayer(_.sesh, ctx);
			_.sesh.updateRenderState({ baseLayer: bl });
			scene.matrixAutoUpdate = false;
			rnd.autoClear = false;
			rnd.clear();
			rnd.setSize(bl.framebufferWidth, bl.framebufferHeight, false);
			ctx.bindFramebuffer(ctx.FRAMEBUFFER, bl.framebuffer);
			zero.core.util.onCurPer(function(per) {
				setTimeout(() => zero.core.camera.angle("pov"));
				_.sesh.requestAnimationFrame(zero.core.xr.tick);
				setTimeout(function() {
					_.armsOn = true;
					for (side of ["left", "right"]) {
						per.body.torso.arms[side].unspring();
						per.body.torso.hands[side].unspring("thumb_curl");
					}
				}, 5000); // ugh
			});
			CT.log("launched!");
		});
	},
	setup: function() {
		var xr = zero.core.xr, _ = xr._;
		navigator.xr.requestSession('immersive-vr').then(function(sesh) {
			_.sesh = sesh;
			_.events();
			sesh.requestReferenceSpace("local").then(xr.launch);
		});
	},
	init: function(opts) {
		var _ = zero.core.xr._, opts = _.opts = CT.merge(opts, {
			ondecide: function() {}
		}), affirmative;
		navigator.xr ? navigator.xr.isSessionSupported('immersive-vr').then(function(isit) {
			if (isit) {
				CT.modal.choice({
					prompt: "enter immersive vr?",
					data: ["yah", "nah"],
					cb: function(answer) {
						affirmative = answer == "yah";
						opts.ondecide(affirmative);
						affirmative && zero.core.xr.setup();
					}
				});
			} else {
				CT.log("webxr (immersive-vr) not supported");
				opts.ondecide();
			}
		}) : opts.ondecide();
	}
};