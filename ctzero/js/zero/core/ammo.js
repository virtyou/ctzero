CT.scriptImport("zero.lib.wasm.ammo");

// adapted from: https://threejs.org/examples/physics_ammo_cloth.html

zero.core.ammo = {
	_: {
		active: false,
		margin: 0.05,
		anchorInfluence: 0.5,
		gravityConstant: -9.8
	},
	tick: function(dts) {
		var _ = zero.core.ammo._;
		if (!_.active) return; // TODO: turn off when all cloth leaves scene...
		_.physicsWorld.stepSimulation(dts, 10); // correct dts scale?
	},
	softBody: function(cloth, anchor, anchorPoints) {
		var _ = zero.core.ammo._, coz = cloth.opts,
			width = coz.width, height = coz.height,
			i, anx, pos = cloth.position(); // global?
		_.active = true; // change to counter?
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
		if (anchor) { // reg anchor as rigid body?
			const abod = anchor.thring.userData.physicsBody;
			anchorPoints = anchorPoints || "ends";
			anx = [];
			if (anchorPoints == "full")
				for (i = 0; i <= coz.numSegsZ; i++)
					anx.push(i);
			else if (anchorPoints == "ends") {
				anx.push(0);
				anx.push(coz.numSegsZ);
			} else
				anx = anchorPoints;
			anx.forEach(a => softBody.appendAnchor(a, abod, false, _.anchorInfluence));
		}
		return softBody;
	},
	load: function(AmmoLib) {
		var _ = zero.core.ammo._;
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

		_.transformAux = new Ammo.btTransform(); // for rigid bodies???
		_.softBodyHelpers = new Ammo.btSoftBodyHelpers();
	},
	init: function() {
		Ammo().then(zero.core.ammo.load);
	}
};