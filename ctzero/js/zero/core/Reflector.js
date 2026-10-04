// planar mirror, adapted from the classic three.js Reflector technique:
// https://threejs.org/examples/webgl_mirror.html (oblique near-plane clip trick
// originally from http://www.terathon.com/code/oblique.html)
//
// unlike zero.core.Pool's old CubeCamera/envMap approach, this renders the scene
// from a camera reflected across the mesh's own world-space plane every frame, so
// it stays perspective-correct as the main camera moves, and it works for any
// plane orientation (horizontal water surface, vertical wall mirror, etc.) since
// the reflection math is derived from the mesh's matrixWorld, not hardcoded axes.
zero.core.Reflector = CT.Class({
	CLASSNAME: "zero.core.Reflector",
	vshader: [
		"uniform mat4 textureMatrix;",
		"varying vec4 vUv;",
		"void main() {",
		"	vUv = textureMatrix * vec4(position, 1.0);",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
		"}"
	].join("\n"),
	fshader: [
		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",
		"uniform float opacity;",
		"varying vec4 vUv;",
		"float blendOverlay(float base, float blend) {",
		"	return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));",
		"}",
		"void main() {",
		"	vec4 base = texture2DProj(tDiffuse, vUv);",
		"	gl_FragColor = vec4(",
		"		blendOverlay(base.r, color.r),",
		"		blendOverlay(base.g, color.g),",
		"		blendOverlay(base.b, color.b),",
		"		opacity",
		"	);",
		"}"
	].join("\n"),
	onremove: function() {
		zero.core.Reflector.unregister(this);
		this.renderTarget.dispose();
	},
	onready: function() {
		zero.core.Reflector.register(this);
	},
	// camera reflected across this mesh's plane + oblique near-plane clip, so the
	// render-to-texture pass below never shows anything "behind" the mirror
	updateMatrix: function(mainCamera) {
		var oz = this.opts, thring = this.thring,
			reflectorWorldPosition = this.reflectorWorldPosition,
			cameraWorldPosition = this.cameraWorldPosition,
			rotationMatrix = this.rotationMatrix,
			normal = this.normal, view = this.view, target = this.target,
			lookAtPosition = this.lookAtPosition, clipPlane = this.clipPlane, q = this.q,
			textureMatrix = this.material.uniforms.textureMatrix.value,
			virtualCamera = this.virtualCamera, reflectorPlane = this.reflectorPlane;

		reflectorWorldPosition.setFromMatrixPosition(thring.matrixWorld);
		cameraWorldPosition.setFromMatrixPosition(mainCamera.matrixWorld);
		rotationMatrix.extractRotation(thring.matrixWorld);

		normal.set(0, 0, 1);
		normal.applyMatrix4(rotationMatrix);

		view.subVectors(reflectorWorldPosition, cameraWorldPosition);
		if (view.dot(normal) > 0) return false; // camera's behind the mirror - skip

		view.reflect(normal).negate();
		view.add(reflectorWorldPosition);

		rotationMatrix.extractRotation(mainCamera.matrixWorld);

		lookAtPosition.set(0, 0, -1);
		lookAtPosition.applyMatrix4(rotationMatrix);
		lookAtPosition.add(cameraWorldPosition);

		target.subVectors(reflectorWorldPosition, lookAtPosition);
		target.reflect(normal).negate();
		target.add(reflectorWorldPosition);

		virtualCamera.position.copy(view);
		virtualCamera.up.set(0, 1, 0);
		virtualCamera.up.applyMatrix4(rotationMatrix);
		virtualCamera.up.reflect(normal);
		virtualCamera.lookAt(target);
		// the main camera can be a bare Object3D "stand" in VR mode (see camera._stand()) -
		// it won't have real near/far/fov, so fall back to sane defaults rather than NaN out
		virtualCamera.near = mainCamera.near || 0.2;
		virtualCamera.far = mainCamera.far || 10000000;
		virtualCamera.fov = mainCamera.fov || core.config.ctzero.camera.fov;
		virtualCamera.aspect = mainCamera.aspect || 1;
		virtualCamera.updateProjectionMatrix();
		virtualCamera.updateMatrixWorld();

		textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);
		textureMatrix.multiply(virtualCamera.projectionMatrix);
		textureMatrix.multiply(virtualCamera.matrixWorldInverse);
		textureMatrix.multiply(thring.matrixWorld);

		reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
		reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
		clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y,
			reflectorPlane.normal.z, reflectorPlane.constant);

		var pe = virtualCamera.projectionMatrix.elements;
		q.x = (Math.sign(clipPlane.x) + pe[8]) / pe[0];
		q.y = (Math.sign(clipPlane.y) + pe[9]) / pe[5];
		q.z = -1.0;
		q.w = (1.0 + pe[10]) / pe[14];
		clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));
		pe[2] = clipPlane.x;
		pe[6] = clipPlane.y;
		pe[10] = clipPlane.z + 1.0 - oz.clipBias;
		pe[14] = clipPlane.w;

		return true;
	},
	render: function() {
		var oz = this.opts, zcu = zero.core.util, thring = this.thring, mat = this.material;
		if (oz.frameSkip && (zcu.ticker % (oz.frameSkip + 1))) return;
		if (!this.updateMatrix(zero.core.camera.get("camera"))) return;
		// bridges Thing.setColor()/setOpacity(), which mutate material.color/.opacity directly
		mat.uniforms.color.value.copy(mat.color);
		mat.uniforms.opacity.value = mat.opacity;
		thring.visible = false; // don't reflect self
		zero.core.camera.get("renderer").render(zero.core.camera.scene, this.virtualCamera, this.renderTarget, true);
		thring.visible = true;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			width: 100,
			height: 100,
			textureWidth: 512,
			textureHeight: 512,
			clipBias: 0.003,
			color: 0x7f7f7f,
			opacity: 1,
			frameSkip: 0, // render the reflection every (frameSkip + 1) ticks
			side: THREE.FrontSide
		}, this.opts);
		// min_opts is the pristine pre-merge opts (set once by the base Thing.init()) - checking
		// it rather than opts.planeGeometry matters because a subclass (e.g. Mirror) can still
		// override width/height in its own init(), which runs after this one. Also skip when an
		// explicit geometry was passed in (e.g. Pool sharing its own wave-animated geometry so
		// the reflection distorts with the waves for free) - planeGeometry would otherwise
		// clobber it in initGeo().
		if (!this.min_opts.planeGeometry && !this.min_opts.geometry)
			opts.planeGeometry = [opts.width, opts.height];

		this.renderTarget = new THREE.WebGLRenderTarget(opts.textureWidth, opts.textureHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat
		});

		var material = opts.matinstance = new THREE.ShaderMaterial({
			uniforms: {
				color: { value: new THREE.Color(opts.color) },
				tDiffuse: { value: this.renderTarget.texture },
				textureMatrix: { value: new THREE.Matrix4() },
				opacity: { value: opts.opacity }
			},
			vertexShader: this.vshader,
			fragmentShader: this.fshader,
			transparent: true,
			side: opts.side
		});
		material.color = material.uniforms.color.value;
		material.opacity = opts.opacity;

		this.virtualCamera = new THREE.PerspectiveCamera();
		this.normal = new THREE.Vector3();
		this.reflectorPlane = new THREE.Plane();
		this.reflectorWorldPosition = new THREE.Vector3();
		this.cameraWorldPosition = new THREE.Vector3();
		this.rotationMatrix = new THREE.Matrix4();
		this.lookAtPosition = new THREE.Vector3(0, 0, -1);
		this.clipPlane = new THREE.Vector4();
		this.view = new THREE.Vector3();
		this.target = new THREE.Vector3();
		this.q = new THREE.Vector4();
	}
}, zero.core.Thing);

zero.core.Reflector.active = []; // shared across all instances - rendered from util.animate()
zero.core.Reflector.register = function(r) {
	zero.core.Reflector.active.push(r);
};
zero.core.Reflector.unregister = function(r) {
	CT.data.remove(zero.core.Reflector.active, r);
};
zero.core.Reflector.renderAll = function() {
	var zcu = zero.core.util, active = zero.core.Reflector.active, r;
	if (!active.length || zcu.shouldSkip()) return;
	zero.core.camera.scene.updateMatrixWorld(); // ensure matrixWorld is current before reflecting
	for (r of active)
		zero.core.camera.visible(r) && r.render();
};
