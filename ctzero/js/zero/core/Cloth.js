zero.core.Cloth = CT.Class({
	CLASSNAME: "zero.core.Cloth",
	tick: function(dts) {
		var geo = this.thring.geometry,
			attrs = geo.attributes,
			pos = attrs.position,
			positions = pos.array,
			numVerts = positions.length / 3,
			nodes = this.softBody.get_m_nodes(),
			ifloat = 0, node, nodePos;
		for (let i = 0; i < numVerts; i++) {
			node = nodes.at(i);
			nodePos = node.get_m_x();
			positions[ifloat++] = nodePos.x();
			positions[ifloat++] = nodePos.y();
			positions[ifloat++] = nodePos.z();
		}
		geo.computeVertexNormals();
		pos.needsUpdate = attrs.normal.needsUpdate = true;
	},
	postassemble: function() {
		var oz = this.opts;
		this.softBody = zero.core.ammo.softBody(this, oz.anchor, oz.anchorPoints);
	},
	init: function(opts) { // should translate geometry?
		opts.width = opts.width || 4;
		opts.height = opts.height || 3;
		opts.numSegsZ = opts.width * 5;
		opts.numSegsY = opts.height * 5;
		this.opts = opts = CT.merge(opts, {
			anchorPoints: "ends",
			rotation: [0, Math.PI * 0.5, 0],
			planeGeometry: [opts.width, opts.height, opts.numSegsZ, opts.numSegsY]
		}, this.opts);
	}
}, zero.core.Thing);