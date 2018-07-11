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
				var pz = [],
					morphs = thang.morphStack[m];
				for (var i = 2; i < morphs.length; i += 3)
					pz.push([morphs[i - 2], morphs[i - 1], morphs[i]]);
				az[m + "Pos"] = {
					type: [],
					value: pz
				};
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
				Object.keys(thang.aspects).map(function(m) {
					return [
						"uniform float " + m,
						"attribute vec3 " + m + "Pos;"
					].join(";\n");
				}).join("\n")).replace("// MORPH LOGIC HERE",
				[
					"vec3 base = vec3(pos);"
				].concat(Object.keys(thang.aspects).map(function(m) {
					return ["x", "y", "z"].map(function(a) {
						return "pos." + a + " += ("
							+ m + "Pos." + a + " - base." + a
							+ ") * " + m + ";";
					}).join("\n");
				})).join("\n"));
		}
		return vert;
	},
	tick: function(thang) {
		for (var m in thang.aspects)
			thang.uniforms[m].value = thang.aspects[m].value;
	}
};