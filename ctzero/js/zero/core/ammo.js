CT.scriptImport("zero.lib.wasm.ammo");

// adapted from: https://threejs.org/examples/physics_ammo_cloth.html
// and: https://www.bluemagnificent.com/physics_tut/final_kinematic.html

zero.core.ammo = {
	_: {
		softs: [],
		rigids: [],
		kinematics: [],
		consts: {
			margin: 0.05,
			damping: 0.01,
			anchorInfluence: 0.5,
			gravityConstant: -9.8
		},
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
			const ammo = zero.core.ammo, _ = ammo._,
				transform = ammo.transform(),
				localInertia = ammo.vector(0, 0, 0),
				motionState = new Ammo.btDefaultMotionState(transform),
				colShape = new Ammo.btBoxShape(ammo.vector(s.x / 2, s.y / 2, s.z / 2)); // TODO: other shapes...
			colShape.setMargin(_.consts.margin);
			colShape.calculateLocalInertia(mass, localInertia);
			const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia),
				body = new Ammo.btRigidBody(rbInfo);
			mass && body.setActivationState(_.STATE.DISABLE_DEACTIVATION);
			_.physicsWorld.addRigidBody(body);
			return body;
		}
	},
	setConst: function(k, v) {
		zero.core.ammo._.consts[k] = v;
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
		const ammo = zero.core.ammo, _ = ammo._;
		if (!_.softs.length && !_.kinematics.length) return;
		let k, s, r;
		for (k of _.kinematics)
			ammo.tickKinematic(k, dts);
		_.physicsWorld.stepSimulation(zero.core.util.dt, 10);
		for (s of _.softs)
			ammo.tickSoft(s, dts);
		for (r of _.rigids)
			ammo.tickRigid(r, dts);
	},
	tickSoft: function(s, dts) {
		const geo = s.geometry,
			attrs = geo.attributes,
			pos = attrs.position,
			positions = pos.array,
			numVerts = positions.length / 3,
			nodes = s.userData.physicsBody.get_m_nodes();
		let i, ifloat = 0, node, nodePos;
		for (i = 0; i < numVerts; i++) {
			node = nodes.at(i);
			nodePos = node.get_m_x();
			positions[ifloat++] = nodePos.x();
			positions[ifloat++] = nodePos.y();
			positions[ifloat++] = nodePos.z();
		}
		geo.computeVertexNormals();
//		geo.computeFaceNormals();
		pos.needsUpdate = attrs.normal.needsUpdate = true;
	},
	tickKinematic: function(k, dts) {
		const ammo = zero.core.ammo, _ = ammo._,
			ms = k.userData.physicsBody.getMotionState();
		ms && ms.setWorldTransform(ammo.kinemaTrans(k));
	},
	tickRigid: function(r, dts) {
		const _ = zero.core.ammo._,
			ms = r.userData.physicsBody.getMotionState();
		if (ms) {
			ms.getWorldTransform(_.transformer);
			const p = _.transformer.getOrigin(),
				q = _.transformer.getRotation();
			r.position.set(p.x(), p.y(), p.z());
			r.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
	},
	rigid: function(mass, p, s, q, mat) { // creates thring
		const _ = zero.core.ammo._;
		q = q || _.defQuat;
		mat = mat || new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
		_.positioner.set(p.x, p.y, p.z);
		_.quatter.set(q.x, q.y, q.z, q.w);
		const thring = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z, 1, 1, 1), mat);
		thring.userData.physicsBody = _.rigid(s, mass);
		zero.core.camera.scene.add(thring);
		mass && _.rigids.push(thring);
		return thring;
	},
	kinematic: function(thring) { // adapts thring
		const _ = zero.core.ammo._;
		thring.getWorldPosition(_.positioner);
		thring.getWorldQuaternion(_.quatter);

		const body = _.rigid(thring.scale, 1); // FIX: thring.scale seems wrong......

		body.setCollisionFlags(_.FLAGS.CF_KINEMATIC_OBJECT);
		thring.userData.physicsBody = body;
		_.kinematics.push(thring);
	},
	hinge: function(r1, r2, p1, p2, axis) {
		const ammo = zero.core.ammo;
		axis = axis || ammo.vector(0, 1, 0);
		const hinge = new Ammo.btHingeConstraint(r1.userData.physicsBody,
			r2.userData.physicsBody, p1, p2, axis, axis, true);
		ammo._.physicsWorld.addConstraint(hinge, true);
		return hinge;
	},
	softBody: function(cloth, anchor, anchorPoints) {
		const ammo = zero.core.ammo, _ = ammo._, consts = _.consts,
			coz = cloth.opts, width = coz.width, height = coz.height,
			pos = cloth.position(null, true),
			c00 = ammo.vector(pos.x, pos.y + height, pos.z),
			c01 = ammo.vector(pos.x, pos.y + height, pos.z - width),
			c10 = ammo.vector(pos.x, pos.y, pos.z),
			c11 = ammo.vector(pos.x, pos.y, pos.z - width),
			softBody = _.softBodyHelpers.CreatePatch(_.physicsWorld.getWorldInfo(),
				c00, c01, c10, c11, coz.numSegsZ + 1, coz.numSegsY + 1, 0, true),
			sbcfg = softBody.get_m_cfg();

		sbcfg.set_viterations(10);
		sbcfg.set_piterations(10);

		sbcfg.set_kDP(consts.damping);

		softBody.setTotalMass(0.9, false);
		Ammo.castObject(softBody, Ammo.btCollisionObject).getCollisionShape().setMargin(consts.margin * 3);
		_.physicsWorld.addSoftBody(softBody, 1, -1);
		cloth.thring.userData.physicsBody = softBody;
		softBody.setActivationState(_.STATE.DISABLE_DEACTIVATION);
		_.softs.push(cloth.thring);
		if (anchor) {
			anchor.userData.physicsBody || ammo.kinematic(anchor);
			const abod = anchor.userData.physicsBody,
				anx = [];
			anchorPoints = anchorPoints || "ends";
			if (anchorPoints == "full")
				for (let i = 0; i <= coz.numSegsZ; i++)
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
			anx.forEach(a => softBody.appendAnchor(a, abod, false, consts.anchorInfluence));
		}
		return softBody;
	},
	vector: function(x, y, z) {
		return new Ammo.btVector3(x, y, z);
	},
	quat: function(x, y, z, w) {
		return new Ammo.btQuaternion(x, y, z, w);
	},
	transform: function(transform, pos, quat) {
		const ammo = zero.core.ammo, _ = ammo._;
		transform = transform || new Ammo.btTransform();
		pos = pos || ammo.vector(_.positioner.x, _.positioner.y, _.positioner.z);
		quat = quat || ammo.quat(_.quatter.x, _.quatter.y, _.quatter.z, _.quatter.w);
		transform.setIdentity();
		transform.setOrigin(pos);
		transform.setRotation(quat);
		return transform;
	},
	kinemaTrans: function(k) {
		const ammo = zero.core.ammo, _ = ammo._;
		k.getWorldPosition(_.positioner);
		k.getWorldQuaternion(_.quatter);
		_.aPositioner.setValue(_.positioner.x, _.positioner.y, _.positioner.z);
		_.aQuatter.setValue(_.quatter.x, _.quatter.y, _.quatter.z, _.quatter.w);
		return ammo.transform(_.transformer, _.aPositioner, _.aQuatter);
	},
	load: function(AmmoLib) {
		const ammo = zero.core.ammo, _ = ammo._;
		Ammo = AmmoLib;

		_.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
		_.dispatcher = new Ammo.btCollisionDispatcher(_.collisionConfiguration);
		_.broadphase = new Ammo.btDbvtBroadphase();
		_.solver = new Ammo.btSequentialImpulseConstraintSolver();
		_.softBodySolver = new Ammo.btDefaultSoftBodySolver();

		_.gravityVector = ammo.vector(0, _.consts.gravityConstant, 0);
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
		const ammo = zero.core.ammo;
		ammo._.onload = onload;
		Ammo().then(ammo.load);
	}
};