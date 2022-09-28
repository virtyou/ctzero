zero.base.clothes = {
	aura: {},
	pelvis: {},
	lumbar: {},
	ribs: {},
	neck: {},
	clavicle: {},
	shoulder: {},
	elbow: {},
	wrist: {},
	finger: {},
	hip: {},
	knee: {},
	ankle: {},
	toe: {}
};

zero.base.clothes.head = { // hats
	conical: {
		coneGeometry: true
	}
};

zero.base.clothes.procedurals = function(kind) {
	if (!kind.startsWith("worn_"))
		return [];
	var bpart = kind.slice(5),
		gz = zero.base.clothes[bpart],
		tmod = "zero.base.clothes." + bpart + ".";
	return Object.keys(gz).map(function(g) {
		return {
			name: g,
			kind: kind,
			thing: "Garment",
			template: tmod + g
		};
	});
};

/*
box, sphere, torusKnot, cone, cylinder, plane
Garment
 - flowy > Hair X Flower???
   - Fabric/Cloth > Flap, Strip
   - skirt, cape, cloak, shawl, hood
 - procedural
   - hat
     - conical [w/ veil/tassel]
     - donut!
     - crowns!!
     - beret
     - fedora
     - tophat [honest abe]
     - tri[etc]-corner hats
*/