zero.core.xr = { // https://01.org/blogs/darktears/2019/rendering-immersive-web-experiences-threejs-webxr
	_: {
		dims: ["x", "y", "z"],
		things: ["grip", "targetRay"],
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
		contrUp: function(frame, space) {
			var _ = zero.core.xr._, c, t, pose, thring, dim;
			if (!_.controllers) return;
			for (c of _.controllers) {
				for (t of _.things) {
					pose = frame.getPose(c[t + "Space"], space);
					thring = _[t][c.handedness].thring;
					if (!thring || !pose) continue;
					for (dim of _.dims)
						thring.position[dim] = pose.transform.position[dim];
					thring.setRotationFromQuaternion(pose.transform.orientation);
					thring.updateMatrixWorld(true);
				}
			}
		},
		contReg: function() {
			var _ = zero.core.xr._, c;
			_.grip = {};
			_.targetRay = {};
			_.controllers = _.sesh.inputSources;
			CT.log(_.controllers.length + " registered controllers");
			for (c of _.controllers) {
				CT.log(c.handedness + " " + c.gamepad.buttons.length);
				_.grip[c.handedness] = new zero.core.Thing({
					name: c.handedness + "grip",
//					scene: camera._.camera,
					geometry: new THREE.CubeGeometry(10, 10, 10),
					material: {
						color: 0xff0000,
						visible: core.config.ctzero.helpers
					}
				});
				_.targetRay[c.handedness] = new zero.core.Thing({
					name: c.handedness + "targetRay",
//					scene: camera._.camera,
					geometry: new THREE.CubeGeometry(1, 1, 30),
					material: {
						color: 0x00ff00,
						visible: core.config.ctzero.helpers
					}
				});
			}
		},
		bval: function(controller, cb) {
			var gp = controller.gamepad, bz = gp.buttons, i, v;
			for (i = 0; i < bz.length; i++) {
				v = bz[i].value;
				if (!v) continue;
				cb(i, v, controller);
			}
			var ax = gp.axes, a;
			for (i = 0; i < ax.length; i++) {
				v = ax[i].value;
				v && CT.log(controller.handedness + " axis " + i + ": " + v);
			}
		},
		select: function(i, v, controller) {
			CT.log(controller.handedness + " select: (jump) " + i + " " + v);
			zero.core.current.controls.mover(500, "y")(); // TODO: clean up
		},
		squeeze: function(i, v, controller) { // TODO: unsqueeze
			var zcc = zero.core.current, pcont = zcc.controls,
				s = (controller.handedness == "left") ? v : -v;
			CT.log(controller.handedness + " squeeze: " + i + " " + v + " " + s);
			zcc.person.go();
			if (i)
				pcont.direct(s * 1000);
			else // TODO: do cleaner (w/o extra function gen)
				pcont.mover(s * 50, "orientation")();
		},
		events: function() {
			var _ = zero.core.xr._, sesh = _.sesh;
			sesh.addEventListener("inputsourceschange", _.contReg);
			sesh.addEventListener("end", () => CT.log("vr session ended"));
			sesh.addEventListener("select", (e) => _.bval(e.inputSource, _.select));
			sesh.addEventListener("squeeze", (e) => _.bval(e.inputSource, _.squeeze));
		}
	},
	tick: function(time, frame) {
		var _ = zero.core.xr._, view, viewport,
			space = zero.core.xr.orient(),
			pose = frame.getViewerPose(space);
		if (pose) {
			_.perUp(pose.transform.orientation);
			camera.scene.updateMatrixWorld(true);
			for (view of pose.views) {
				viewport = _.sesh.baseLayer.getViewport(view);
				_.eye(pose.viewMatrix, view, viewport);
			}
			_.contrUp(frame, space);
		}
		_.sesh.requestAnimationFrame(zero.core.xr.tick);
	},
	orient: function() {
		var _ = zero.core.xr._, sprz = camera.springs, pos = sprz.position, rot = sprz.rotation;
		return _.trans(_.space, {
			x: pos.x.target,
			y: pos.y.target,
			z: pos.z.target
		}, {
			x: rot.x.target,
			y: rot.y.target,
			z: rot.z.target
		});
	},
	launch: function(space) {
		var _ = zero.core.xr._, rnd = _.renderer = new THREE.WebGLRenderer(),
			ctx = rnd.context, scene = camera.scene, bl;
		_.space = space;
		ctx.makeXRCompatible().then(function() {
			bl = _.sesh.baseLayer = new XRWebGLLayer(_.sesh, ctx);
			_.sesh.updateRenderState({ baseLayer: bl });
			scene.matrixAutoUpdate = false;
			rnd.autoClear = false;
			rnd.clear();
			rnd.setSize(bl.framebufferWidth, bl.framebufferHeight, false);
			ctx.bindFramebuffer(ctx.FRAMEBUFFER, bl.framebuffer);
			zero.core.util.onCurPer(function() {
				setTimeout(() => zero.core.camera.angle("pov"));
				_.sesh.requestAnimationFrame(zero.core.xr.tick);
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