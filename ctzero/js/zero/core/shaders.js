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
		return uz;
	},
	attributes: function(thang) {
		var az = {};
		if (thang.morphStack) {
			for (var m in thang.morphStack) {
				az[m] = {
					type: 'f',
					value: thang.morphStack[m]
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
					return "uniform float " + m;
				}).join(";\n")).replace("// MORPH LOGIC HERE",
				Object.keys(thang.morphStack).map(function(m) {
					var morph = thang.morphStack[m];

					return ""; // TODO: mod pos!!

				}).join(";\n"));
		}
		return vert;
	}
};