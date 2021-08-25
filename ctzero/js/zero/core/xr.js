zero.core.xr = { // https://01.org/blogs/darktears/2019/rendering-immersive-web-experiences-threejs-webxr
	_: {
		eye: function(viewMatrixArray, view, viewport) {
			var _ = zero.core.xr._, rnd = _.renderer,
				scene = camera.scene, cam = camera.get();
			rnd.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
//			var projectionMatrix = view.projectionMatrix;
//			var viewMatrix = new THREE.Matrix4();
//			viewMatrix.fromArray(viewMatrixArray);
//			cam.projectionMatrix.fromArray(projectionMatrix);
//			cam.matrixWorldInverse.copy(viewMatrix);


			rnd.render(scene, camera._[view.eye].camera || cam);
			rnd.clearDepth();
		}
	},
	tick: function(time, frame) {
		var _ = zero.core.xr._, view, viewport,
			pose = frame.getViewerPose(_.space),
			cam = camera.get();
		if (pose) {

			// NB: rotating _stand_ -> rotate stand's parent instead?

//			cam.position.x = pose.transform.position.x;
//			cam.position.y = pose.transform.position.y;
//			cam.position.z = pose.transform.position.z;
			cam.setRotationFromQuaternion(pose.transform.orientation);
			camera.scene.updateMatrixWorld(true);


			for (view of pose.views) {
				viewport = _.sesh.baseLayer.getViewport(view);
				_.eye(pose.viewMatrix, view, viewport);
			}
		}
		_.sesh.requestAnimationFrame(zero.core.xr.tick);
	},
	launch: function(space) {
		var _ = zero.core.xr._, rnd = _.renderer = new THREE.WebGLRenderer(),
			ctx = rnd.context, scene = camera.scene, bl;
		_.space = space;
		ctx.makeXRCompatible().then(function() {
			bl = _.sesh.baseLayer = new XRWebGLLayer(_.sesh, ctx);
			_.sesh.updateRenderState({ baseLayer: bl });
			_.sesh.requestAnimationFrame(zero.core.xr.tick);
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