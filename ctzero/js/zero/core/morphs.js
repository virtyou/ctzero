zero.core.morphs = {
	_xyz: ["x", "y", "z"],
	deprecated: function(thing) { // basic example -- current tick() faster, even on ios
		var geo = thing.thring.geometry, a, i, val, dim,
			vert = geo.vertices[0], dims = zero.core.morphs._xyz,
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
		if (zero.core.util.shouldSkip(false, 120)) return;
		if (thing.opts.shader)
			return zero.core.shaders.tick(thing);
		var geo = thing.thring.geometry, modz = {},
			dimz = zero.core.morphs._xyz, a, i, val, stack, base = thing.base;
		if (thing._upped) {
			for (a = 0; a < thing._upped.length; a++) {
				i = thing._upped[a];
				geo.vertices[Math.floor(i / 3)][dimz[i % 3]] = base[i];
			}
			delete thing._upped;
		}
		for (a in thing.morphs) {
			val = thing.aspects[a].value;
			if (val) { // should be safe...
				stack = thing.morphs[a];
				for (i in stack)
					modz[i] = (modz[i] || base[i]) + stack[i] * val;
			}
		}
		for (i in modz)
			geo.vertices[Math.floor(i / 3)][dimz[i % 3]] = modz[i];
		geo.verticesNeedUpdate = true;
	},
	delta: function(thing, a) {
		var diff, i, morphz = thing.morphs[a] = {},
			m = thing.morphStack[a], base = thing.base,
			cutoff = core.config.ctzero.morphs.delta_cutoff;
		for (i = 0; i < base.length; i++) {
			diff = m[i] - base[i];
			if (Math.abs(diff) > cutoff)
				morphz[i] = diff;
		}
	},
	apply: function(thing) {
		var stack, degree, diff, diffz = {}, base = thing.base,
			i, m, cutoff = core.config.ctzero.morphs.delta_cutoff;
		thing.staticMorphs = [];
		for (m in thing.morphStack) {
			if (!thing.morphs[m]) {
				thing.staticMorphs.push(m);
				if (thing.opts.skipPrecompile || !thing.opts.morphs[m])
					continue;
				degree = thing.opts.morphs[m];
				stack = thing.morphStack[m];
				for (i = 0; i < base.length; i++) {
					diff = stack[i] - base[i];
					if (Math.abs(diff) > cutoff) {
						diffz[i] = diffz[i] || 0;
						diffz[i] += diff * degree;
					}
				}
			}
		}
		for (i in diffz)
			base[i] += diffz[i];
		thing._upped = Object.keys(diffz);
	},
	init: function(thing) {
		if (!thing.opts.shader) {
			thing.morphs = {};
			for (var a in thing.aspects)
				zero.core.morphs.delta(thing, a);
			zero.core.morphs.apply(thing);
		}
	}
};