zero.core.shaders = {
	uniforms: function(thang, map) {
		var uz = {};
		if (map) {
			uz.baseTexture = {
				type: "t",
				value: map
			};
		}
		if (thang.morphStack) {
			for (var m in thang.aspects) {
				uz[m] = {
					type: 'f',
					value: 0.0
				}
			}
		}
		thang.uniforms = uz;
		return uz;
	},
	attributes: function(thang) {
		var az = {};
		if (thang.morphStack) {
			for (var m in thang.aspects) {
				var splitz = { x: [], y: [], z: [] },
					morphs = thang.morphStack[m];
				for (var i = 2; i < morphs.length; i += 3) {
					splitz.x.push(morphs[i - 2]);
					splitz.y.push(morphs[i - 1]);
					splitz.z.push(morphs[i]);
				}
				for (var a in splitz) {
					az[m + "_" + a] = {
						type: 'f',
						value: splitz[a]
					}
				}
			}
		}
		return az;
	},
	fragment: function(thang) {
		return CT.net.get("/js/shaders/basic.frag");
	},
	vertex: function(thang) {
		var vert = CT.net.get("/js/shaders/basic.vert");
		if (thang.morphStack) { // ugh only 4? probs use BufferGeometry attributes.....
			vert = vert.replace("// MORPH IMPORTS HERE",
				Object.keys(thang.aspects).slice(0, 4).map(function(m) {
					return [
						"uniform float " + m,
						"attribute float " + m + "_x",
						"attribute float " + m + "_y",
						"attribute float " + m + "_z;",
					].join(";\n");
				}).join("\n")).replace("// MORPH LOGIC HERE",
				[
					"vec3 base = vec3(pos);"
				].concat(Object.keys(thang.aspects).slice(0, 4).map(function(m) {
					return ["x", "y", "z"].map(function(a) {
						return "pos." + a + " += ("
							+ m + "_" + a + " - base." + a
							+ ") * " + m + ";";
					}).join("\n");
				})).join("\n"));
		}
//		console.log(vert);
		return vert;
	},
	tick: function(thang) {
		for (var m in thang.uniforms)
			thang.uniforms[m].value = thang.aspects[m].value;
	}
};