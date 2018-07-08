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
			for (var m in thang.morphStack) {
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
			for (var m in thang.morphStack) {
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
		if (thang.morphStack) {
			vert = vert.replace("// MORPH IMPORTS HERE",
				Object.keys(thang.morphStack).map(function(m) {
					return [
						"uniform float " + m,
						"attribute float " + m + "_x",
						"attribute float " + m + "_y",
						"attribute float " + m + "_z;",
					].join(";\n");
				}).join("\n")).replace("// MORPH LOGIC HERE",
				[
					"vec3 base = vec3(pos);"
				].concat(Object.keys(thang.morphStack).map(function(m) {
					return ["x", "y", "z"].map(function(a) {
						return "pos." + a + " += ("
							+ m + "_" + a + " - base." + a
							+ ") * " + m + ";";
					}).join("\n");
				})).join("\n"));
		}
		return vert;
	},
	tick: function(thang) {
		for (var m in thang.uniforms)
			thang.uniforms[m].value = thang.aspects[m].value;
	}
};