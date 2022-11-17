CT.scriptImport("zero.lib.wasm.ammo");

// adapted from: https://threejs.org/examples/physics_ammo_cloth.html
// and: https://www.bluemagnificent.com/physics_tut/final_kinematic.html

zero.core.ammo = {
	_: {
		softs: [],
		kinematics: [],
		margin: 0.05,
		anchorInfluence: 0.5,
		gravityConstant: -9.8,
		STATE: {
			DISABLE_DEACTIVATION: 4
		},
		FLAGS: {
			CF_KINEMATIC_OBJECT: 2
		}
	},
	unSoft: function(s) {
		CT.data.remove(zero.core.ammo._.softs, s);
	},
	unKinematic: function(k) {
		CT.data.remove(zero.core.ammo._.kinematics, k);
	},
	tick: function(dts) {
		let _ = zero.core.ammo._, k, s;
		if (!_.softs.length && !_.kinematics.length) return;
		for (k of _.kinematics)
			zero.core.ammo.tickKinematic(k, dts);
		_.physicsWorld.stepSimulation(dts, 10); // correct dts scale?
		for (s of _.softs)
			s.tick(dts);
	},
	tickKinematic: function(k, dts) {
		let _ = zero.core.ammo._;
		k.getWorldPosition(_.positioner);
		k.getWorldQuaternion(_.quatter);
		let ms = k.userData.physicsBody.getMotionState();
		if (ms) {
			_.transformer.setIdentity();
			_.transformer.setOrigin(_.positioner);
			_.transformer.setRotation(_.quatter);
			ms.setWorldTransform(_.transformer);
		}
	},
	kinematic: function(thring) {
		let _ = zero.core.ammo._, s = thring.scale, mass = 1,
			transform = new Ammo.btTransform();
		thring.getWorldPosition(_.positioner);
		thring.getWorldQuaternion(_.quatter);
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(_.positioner.x, _.positioner.y, _.positioner.z));
		transform.setRotation(new Ammo.btQuaternion(_.quatter.x, _.quatter.y, _.quatter.z, _.quatter.w));
		let localInertia = new Ammo.btVector3(0, 0, 0),
			motionState = new Ammo.btDefaultMotionState(transform),
			colShape = new Ammo.btBoxShape(new Ammo.btVector3(s.x / 2, s.y / 2, s.z / 2)); // TODO: other shapes...
		colShape.setMargin(_.margin);
		colShape.calculateLocalInertia(mass, localInertia);
		let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia),
			body = new Ammo.btRigidBody(rbInfo);
		body.setActivationState(_.STATE.DISABLE_DEACTIVATION);
		body.setCollisionFlags(_.FLAGS.CF_KINEMATIC_OBJECT);
		thring.userData.physicsBody = body;
		_.physicsWorld.addRigidBody(body);
		_.kinematics.push(thring);
	},
	softBody: function(cloth, anchor, anchorPoints) {
		let _ = zero.core.ammo._, coz = cloth.opts,
			width = coz.width, height = coz.height,
			i, anx, pos = cloth.position(null, true);
		const c00 = new Ammo.btVector3(pos.x, pos.y + height, pos.z);
		const c01 = new Ammo.btVector3(pos.x, pos.y + height, pos.z - width);
		const c10 = new Ammo.btVector3(pos.x, pos.y, pos.z);
		const c11 = new Ammo.btVector3(pos.x, pos.y, pos.z - width);
		const softBody = _.softBodyHelpers.CreatePatch(_.physicsWorld.getWorldInfo(),
			c00, c01, c10, c11, coz.numSegsZ + 1, coz.numSegsY + 1, 0, true);
		const sbcfg = softBody.get_m_cfg();
		sbcfg.set_viterations(10);
		sbcfg.set_piterations(10);
		softBody.setTotalMass(0.9, false);
		Ammo.castObject(softBody, Ammo.btCollisionObject).getCollisionShape().setMargin(_.margin * 3);
		_.physicsWorld.addSoftBody(softBody, 1, -1);
		cloth.thring.userData.physicsBody = softBody;
		softBody.setActivationState(4);
		_.softs.push(cloth);
		if (anchor) {
			zero.core.ammo.kinematic(anchor);
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
	load: function(AmmoLib) {
		let _ = zero.core.ammo._;
		Ammo = AmmoLib;

		_.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
		_.dispatcher = new Ammo.btCollisionDispatcher(_.collisionConfiguration);
		_.broadphase = new Ammo.btDbvtBroadphase();
		_.solver = new Ammo.btSequentialImpulseConstraintSolver();
		_.softBodySolver = new Ammo.btDefaultSoftBodySolver();

		_.gravityVector = new Ammo.btVector3(0, _.gravityConstant, 0);
		_.physicsWorld = new Ammo.btSoftRigidDynamicsWorld(_.dispatcher,
			_.broadphase, _.solver, _.collisionConfiguration, _.softBodySolver);
		_.physicsWorld.setGravity(_.gravityVector);
		_.physicsWorld.getWorldInfo().set_m_gravity(_.gravityVector);

		_.transformer = new Ammo.btTransform();
//		_.positioner = new Ammo.btVector3();
//		_.quatter = new Ammo.btQuaternion();
		_.positioner = new THREE.Vector3();
		_.quatter = new THREE.Quaternion();
		_.softBodyHelpers = new Ammo.btSoftBodyHelpers();
	},
	init: function() {
		Ammo().then(zero.core.ammo.load);
	}
};