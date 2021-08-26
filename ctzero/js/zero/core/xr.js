zero.core.xr = { // https://01.org/blogs/darktears/2019/rendering-immersive-web-experiences-threejs-webxr
	_: {
		dims: ["x", "y", "z"],
		things: ["grip", "targetRay"],
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
			var per = zero.core.current.person, pbs,
				rot = new THREE.Euler().setFromQuaternion(orientation);
			pbs = per.body.springs;
			pbs.shake.target = rot.y;
			pbs.nod.target = -rot.x;
//			pbs.tilt.target = rot.z; // TODO: (rig pov cam to rotate)
		},
		gripUp: function(thring, pose) {
			pose.gripMatrix && thring.matrix.fromArray(pose.gripMatrix);
		},
		targetRayUp: function(thring, pose) {
			var _ = zero.core.xr._, dim;
			for (dim of _.dims)
				thring.position[dim] = pose.transform.position[dim];
			thring.setRotationFromQuaternion(pose.transform.orientation);
		},
		contrUp: function(frame) {
			var _ = zero.core.xr._, c, t, pose, thring;
			if (!_.controllers) return;
			CT.log(_.controllers.length + " controllers to tick");
			for (c of _.controllers) {
				for (t of _.things) {
					pose = frame.getPose(c[t + "Space"], _.space);
					thring = _[t][c.handedness].thring;
					if (!thring || !pose) continue;
					_[t + "Up"](thring, pose);
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
				_.grip[c.handedness] = new zero.core.Thing({
					name: c.handedness + "grip",
					geometry: new THREE.CubeGeometry(10, 10, 10),
					material: {
						color: 0xff0000,
						visible: core.config.ctzero.helpers
					}
				});
				_.targetRay[c.handedness] = new zero.core.Thing({
					name: c.handedness + "targetRay",
					geometry: new THREE.CubeGeometry(1, 1, 30),
					material: {
						color: 0x00ff00,
						visible: core.config.ctzero.helpers
					}
				});
			}
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
			_.contrUp(frame);
		}
		_.sesh.requestAnimationFrame(zero.core.xr.tick);
	},
	orient: function() {
		var _ = zero.core.xr._, sprz = camera.springs, pos = sprz.position, rot = sprz.rotation;
		_.space = _.trans(_.space, {
			x: pos.x.target,
			y: pos.y.target,
			z: pos.z.target
		}, {
			x: rot.x.target,
			y: rot.y.target,
			z: rot.z.target
		});
		CT.log("oriented space - switching to pov and starting tick");
		setTimeout(() => zero.core.camera.angle("pov"));
		_.sesh.requestAnimationFrame(zero.core.xr.tick);
	},
	launch: function(space) {
		var _ = zero.core.xr._, rnd = _.renderer = new THREE.WebGLRenderer(),
			ctx = rnd.context, scene = camera.scene, bl;
		_.space = space;
		ctx.makeXRCompatible().then(function() {
			zero.core.util.onCurPer(zero.core.xr.orient);
			bl = _.sesh.baseLayer = new XRWebGLLayer(_.sesh, ctx);
			_.sesh.updateRenderState({ baseLayer: bl });
			scene.matrixAutoUpdate = false;
			rnd.autoClear = false;
			rnd.clear();
			rnd.setSize(bl.framebufferWidth, bl.framebufferHeight, false);
			ctx.bindFramebuffer(ctx.FRAMEBUFFER, bl.framebuffer);
			CT.log("launched!");
		});
	},
	setup: function() {
		var _ = zero.core.xr._;
		navigator.xr.requestSession('immersive-vr').then(function(sesh) {
			_.sesh = sesh;
			sesh.addEventListener("inputsourceschange", _.contReg);
			sesh.addEventListener("end", () => CT.log("vr session ended"));
			sesh.requestReferenceSpace("local").then(zero.core.xr.launch);
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