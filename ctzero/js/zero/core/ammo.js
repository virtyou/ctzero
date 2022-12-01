CT.scriptImport("zero.lib.wasm.ammo");

// adapted from: https://threejs.org/examples/physics_ammo_cloth.html
// and: https://www.bluemagnificent.com/physics_tut/final_kinematic.html

zero.core.ammo = {
	_: {
		softs: [],
		rigids: [],
		kinematics: [],
		margin: 0.05,
		anchorInfluence: 0.5,
		gravityConstant: -9.8,
		STATE: {
			DISABLE_DEACTIVATION: 4
		},
		FLAGS: {
			CF_KINEMATIC_OBJECT: 2
		},
		defQuat: {
			x: 0, y: 0, z: 0, w: 1
		},
		rigid: function(s, mass) {
			let ammo = zero.core.ammo, _ = ammo._, transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin(ammo.vector(_.positioner.x, _.positioner.y, _.positioner.z));
			transform.setRotation(new Ammo.btQuaternion(_.quatter.x, _.quatter.y, _.quatter.z, _.quatter.w));
			let localInertia = ammo.vector(0, 0, 0),
				motionState = new Ammo.btDefaultMotionState(transform),
				colShape = new Ammo.btBoxShape(ammo.vector(s.x / 2, s.y / 2, s.z / 2)); // TODO: other shapes...
			colShape.setMargin(_.margin);
			colShape.calculateLocalInertia(mass, localInertia);
			let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia),
				body = new Ammo.btRigidBody(rbInfo);
			mass && body.setActivationState(_.STATE.DISABLE_DEACTIVATION);
			_.physicsWorld.addRigidBody(body);
			return body;
		}
	},
	unSoft: function(s) {
		CT.data.remove(zero.core.ammo._.softs, s);
	},
	unRigid: function(r) {
		CT.data.remove(zero.core.ammo._.rigids, r);
	},
	unKinematic: function(k) {
		CT.data.remove(zero.core.ammo._.kinematics, k);
	},
	tick: function(dts) {
		let _ = zero.core.ammo._, k, s, r;
		if (!_.softs.length && !_.kinematics.length) return;
		for (k of _.kinematics)
			zero.core.ammo.tickKinematic(k, dts);
		_.physicsWorld.stepSimulation(dts, 10); // correct dts scale?
		for (s of _.softs)
			s.tick(dts);
		for (r of _.rigids)
			zero.core.ammo.tickRigid(r, dts);
	},
	tickKinematic: function(k, dts) {
		let _ = zero.core.ammo._;
		k.getWorldPosition(_.positioner);
		k.getWorldQuaternion(_.quatter);
		let ms = k.userData.physicsBody.getMotionState();
		if (ms) {
			_.aPositioner.setValue(_.positioner.x, _.positioner.y, _.positioner.z);
			_.aQuatter.setValue(_.quatter.x, _.quatter.y, _.quatter.z, _.quatter.w);
			_.transformer.setIdentity();
			_.transformer.setOrigin(_.aPositioner);
			_.transformer.setRotation(_.aQuatter);
			ms.setWorldTransform(_.transformer);
		}
	},
	tickRigid: function(r, dts) {
		let _ = zero.core.ammo._,
			ms = r.userData.physicsBody.getMotionState();
		if (ms) {
			ms.getWorldTransform(_.transformer);
			const p = _.transformer.getOrigin();
			const q = _.transformer.getRotation();
			r.position.set(p.x(), p.y(), p.z());
			r.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
	},
	rigid: function(mass, p, s, q, mat) { // creates thring
		let _ = zero.core.ammo._, thring;
		q = q || _.defQuat;
		mat = mat || new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
		_.positioner.set(p.x, p.y, p.z);
		_.quatter.set(q.x, q.y, q.z, q.w);
		thring = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z, 1, 1, 1), mat);
		thring.userData.physicsBody = _.rigid(s, mass);
		zero.core.camera.scene.add(thring);
		mass && _.rigids.push(thring);
		return thring;
	},
	kinematic: function(thring) { // adapts thring
		let _ = zero.core.ammo._, body;
		thring.getWorldPosition(_.positioner);
		thring.getWorldQuaternion(_.quatter);
		body = _.rigid(thring.scale, 1); // FIX: thring.scale seems wrong......
		body.setCollisionFlags(_.FLAGS.CF_KINEMATIC_OBJECT);
		thring.userData.physicsBody = body;
		_.kinematics.push(thring);
	},
	hinge: function(r1, r2, p1, p2, axis) {
		let ammo = zero.core.ammo;
		axis = axis || ammo.vector(0, 1, 0);
		ammo._.physicsWorld.addConstraint(new Ammo.btHingeConstraint(r1.userData.physicsBody,
			r2.userData.physicsBody, p1, p2, axis, axis, true), true);
	},
	softBody: function(cloth, anchor, anchorPoints) {
		let ammo = zero.core.ammo, _ = ammo._, coz = cloth.opts,
			width = coz.width, height = coz.height,
			i, anx, pos = cloth.position(null, true);
		const c00 = ammo.vector(pos.x, pos.y + height, pos.z);
		const c01 = ammo.vector(pos.x, pos.y + height, pos.z - width);
		const c10 = ammo.vector(pos.x, pos.y, pos.z);
		const c11 = ammo.vector(pos.x, pos.y, pos.z - width);
		const softBody = _.softBodyHelpers.CreatePatch(_.physicsWorld.getWorldInfo(),
			c00, c01, c10, c11, coz.numSegsZ + 1, coz.numSegsY + 1, 0, true);
		const sbcfg = softBody.get_m_cfg();
		sbcfg.set_viterations(10);
		sbcfg.set_piterations(10);
		softBody.setTotalMass(0.9, false);
		Ammo.castObject(softBody, Ammo.btCollisionObject).getCollisionShape().setMargin(_.margin * 3);
		_.physicsWorld.addSoftBody(softBody, 1, -1);
		cloth.thring.userData.physicsBody = softBody;
		softBody.setActivationState(_.STATE.DISABLE_DEACTIVATION);
		_.softs.push(cloth);
		if (anchor) {
			anchor.userData.physicsBody || ammo.kinematic(anchor);
			const abod = anchor.userData.physicsBody;
			anchorPoints = anchorPoints || "ends";
			anx = [];
			if (anchorPoints == "full")
				for (i = 0; i <= coz.numSegsZ; i++)
					anx.push(i);
			else if (anchorPoints == "ends") {
				anx.push(0);
				anx.push(coz.numSegsZ);
			} else if (anchorPoints == "start")
				anx.push(0);
			else if (anchorPoints == "end")
				anx.push(coz.numSegsZ);
			else if (anchorPoints == "mid")
				anx.push(Math.floor(coz.numSegsZ / 2));
			else
				anx = anchorPoints;
			anx.forEach(a => softBody.appendAnchor(a, abod, false, _.anchorInfluence));
		}
		return softBody;
	},
	vector: function(x, y, z) {
		return new Ammo.btVector3(x, y, z);
	},
	load: function(AmmoLib) {
		let ammo = zero.core.ammo, _ = ammo._;
		Ammo = AmmoLib;

		_.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
		_.dispatcher = new Ammo.btCollisionDispatcher(_.collisionConfiguration);
		_.broadphase = new Ammo.btDbvtBroadphase();
		_.solver = new Ammo.btSequentialImpulseConstraintSolver();
		_.softBodySolver = new Ammo.btDefaultSoftBodySolver();

		_.gravityVector = ammo.vector(0, _.gravityConstant, 0);
		_.physicsWorld = new Ammo.btSoftRigidDynamicsWorld(_.dispatcher,
			_.broadphase, _.solver, _.collisionConfiguration, _.softBodySolver);
		_.physicsWorld.setGravity(_.gravityVector);
		_.physicsWorld.getWorldInfo().set_m_gravity(_.gravityVector);

		_.transformer = new Ammo.btTransform();
		_.positioner = new THREE.Vector3();
		_.quatter = new THREE.Quaternion();
		_.aPositioner = new Ammo.btVector3();
		_.aQuatter = new Ammo.btQuaternion();
		_.softBodyHelpers = new Ammo.btSoftBodyHelpers();
		_.onload && _.onload();
	},
	init: function(onload) {
		let ammo = zero.core.ammo;
		ammo._.onload = onload;
		Ammo().then(ammo.load);
	}
};