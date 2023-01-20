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
		geometry2shape: {
			BoxGeometry: "btBoxShape",
			ConeGeometry: "btConeShape",
			SphereGeometry: "btSphereShape",
			CylinderGeometry: "btCylinderShape"
		},
		shape: function(thring, s) {
			const ammo = zero.core.ammo, _ = ammo._, geo = thring.geometry,
				t = geo && geo.type, pars = geo && geo.parameters,
				shaper = Ammo[_.geometry2shape[t] || "btBoxShape"];
			s = s || thring.scale;
			if (t == "SphereGeometry")
				return new shaper(pars.radius);
			if (t == "ConeGeometry")
				return new shaper(pars.radius, pars.height);
			if (t == "CylinderGeometry") {
				let r = pars.radiusTop;
				return new shaper(ammo.vector(r, pars.height / 2, r));
			}
			// BoxGeometry (default)
			return new shaper(ammo.vector(s.x / 2, s.y / 2, s.z / 2));
		},
		rigid: function(thring, s, mass, friction) {
			const ammo = zero.core.ammo, _ = ammo._,
				transform = ammo.transform(),
				localInertia = ammo.vector(0, 0, 0),
				motionState = new Ammo.btDefaultMotionState(transform),
				colShape = _.shape(thring, s);
			colShape.setMargin(_.consts.margin);
			colShape.calculateLocalInertia(mass, localInertia);
			const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
			if (friction)
				rbInfo.m_friction = friction;
			const body = new Ammo.btRigidBody(rbInfo);
			mass && body.setActivationState(_.STATE.DISABLE_DEACTIVATION);
			_.physicsWorld.addRigidBody(body);
			return body;
		},
		patch: function(cloth, anchor, anchorPoints) {
			const ammo = zero.core.ammo, _ = ammo._, coz = cloth.opts,
				width = coz.width, height = coz.height,
				pos = coz.displacement, winfo = _.physicsWorld.getWorldInfo();

			if (anchorPoints == "none") {
				let offer = anchor.getWorldPosition(_.positioner);
				["x", "y", "z"].forEach(function(d) {
					pos[d] += offer[d];
				});
			}

			if (coz.ellipsoid) // ellipsoid  is jank and seems broken....
				return _.softBodyHelpers.CreateEllipsoid(winfo,
					ammo.vector(pos.x, pos.y, pos.z),
					ammo.vector(cloth.scale.x, cloth.scale.y, cloth.scale.z), 16);

			const fdim = coz.flatDim, hw = width / 2, hh = height / 2,
				fy = fdim == "y", y01 = fy ? pos.y : (pos.y + height);

			let evenX, oddX, evenZ, oddZ;
			evenX = oddX = pos.x;
			evenZ = oddZ = pos.z;
			if (fy) {
				evenX -= hw;
				oddX += hw;
				evenZ += hh;
				oddZ -= hh;
			} else if (fdim == "x") {
				evenZ += hw;
				oddZ -= hw;
			} else {
				evenX -= hw;
				oddX += hw;
			}

			const c00 = ammo.vector(evenX, y01, evenZ),
				c01 = ammo.vector(oddX, y01, evenZ),
				c10 = ammo.vector(evenX, pos.y, oddZ),
				c11 = ammo.vector(oddX, pos.y, oddZ);
			return _.softBodyHelpers.CreatePatch(winfo,
					c00, c01, c10, c11, coz.numSegsZ + 1, coz.numSegsY + 1, 0, true);
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
	tick: function(dt) {
		const ammo = zero.core.ammo, _ = ammo._;
		if (!_.softs.length && !_.kinematics.length) return;
		let k, s, r;
		for (k of _.kinematics)
			ammo.tickKinematic(k);
		_.physicsWorld.stepSimulation(dt, 10);
		for (s of _.softs)
			ammo.tickSoft(s);
		for (r of _.rigids)
			ammo.tickRigid(r);
	},
	tickSoft: function(s) {
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
	tickKinematic: function(k) {
		const ammo = zero.core.ammo, _ = ammo._,
			ms = k.userData.physicsBody.getMotionState();
		ms && ms.setWorldTransform(ammo.kinemaTrans(k));
	},
	tickRigid: function(r) {
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
	rigid: function(mass, p, s, q, mat, friction) { // creates thring
		const _ = zero.core.ammo._;
		q = q || _.defQuat;
		mat = mat || new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
		_.positioner.set(p.x, p.y, p.z);
		_.quatter.set(q.x, q.y, q.z, q.w);
		const thring = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z, 1, 1, 1), mat);

		thring.position.copy(p);
		thring.quaternion.copy(q);

		thring.userData.physicsBody = _.rigid(thring, s, mass, friction);
		zero.core.camera.scene.add(thring);
		mass && _.rigids.push(thring);
		return thring;
	},
	kinematic: function(thring, friction) { // adapts thring
		const _ = zero.core.ammo._;
		thring.getWorldPosition(_.positioner);
		thring.getWorldQuaternion(_.quatter);

		const body = _.rigid(thring, null, 1, friction);

		body.setCollisionFlags(_.FLAGS.CF_KINEMATIC_OBJECT);
		thring.userData.physicsBody = body;
		_.kinematics.push(thring);
	},
	kineBody: function(thring, friction) {
		thring.userData.physicsBody || zero.core.ammo.kinematic(thring, friction);
		return thring.userData.physicsBody;
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
			coz = cloth.opts, softBody = _.patch(cloth, anchor, anchorPoints),
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
			const endPoint = coz.numSegzZ * coz.numSegzY;
			if (Array.isArray(anchor)) {
				const aseg = endPoint / anchor.length;
				anchor.forEach((a, i) => softBody.appendAnchor(aseg * i,
					ammo.kineBody(coz.garment[a].thring), false, consts.anchorInfluence));
			} else {
				const abod = ammo.kineBody(anchor);
				let i, anx = [];
				anchorPoints = anchorPoints || "ends";
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
				else if (anchorPoints == "center")
					anx.push(Math.floor(endPoint / 2));
				else if (anchorPoints == "corners") {
					anx.push(0);
					anx.push(coz.numSegsZ);
					anx.push(endPoint - coz.numSegsZ);
					anx.push(endPoint);
				}
				else
					anx = anchorPoints;
				if (anx != "none")
					anx.forEach(a => softBody.appendAnchor(a, abod, false, consts.anchorInfluence));
			}
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