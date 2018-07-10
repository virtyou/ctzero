zero.core.morphs = {
	ios: function(thing) {
		var geo = thing.body.thring.geometry, a, i, val, dim,
			vert = geo.vertices[0], dims = ["x", "y", "z"],
			morphStack = thing.morphStack, base = thing.base;
		for (i = 0; i < geo.vertices.length * 3; i++) {
			val = base[i];
			for (a in thing.aspects)
				val += (morphStack[a][i] - base[i]) * thing.aspects[a].value;
			dim = dims[i % 3];
			if (dim == "x")
				vert = geo.vertices[i / 3];
			vert[dim] = val;
		}
		geo.verticesNeedUpdate = true;
	},
	tick: function(thing) {
		if (thing.opts.shader)
			return zero.core.shaders.tick(thing);
		if (CT.info.iOs)
			return zero.core.morphs.ios(thing);
		var geo = thing.body.thring.geometry, modz = {},
			dimz = ["x", "y", "z"], a, i, val, stack, base = thing.base;
		for (a in thing.morphs) {
			val = thing.aspects[a].value;
			if (val) { // should be safe...
				stack = thing.morphs[a];
				for (i in stack) {
					modz[i] = modz[i] || base[i];
					modz[i] += (stack[i] - base[i]) * val;
				}
			}
		}
		for (i in modz)
			geo.vertices[Math.floor(i / 3)][dimz[i % 3]] = modz[i];
		geo.verticesNeedUpdate = true;
	},
	delta: function(thing, a) {
		var m = thing.morphStack[a],
			morphz = thing.morphs[a] = {};
		thing.base.forEach(function(b, i) {
			if (b != m[i])
				morphz[i] = m[i];
		});
	},
	init: function(thing) {
		if (!thing.opts.shader && !CT.info.iOs) {
			thing.morphs = {};
			for (var a in thing.aspects)
				zero.core.morphs.delta(thing, a);
		}
	}
};