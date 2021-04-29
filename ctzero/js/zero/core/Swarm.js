zero.core.Swarm = CT.Class({
	CLASSNAME: "zero.core.Swarm",
	tick: function(dts) {
		if (!this.pool) return; // wait
		var zcu = zero.core.util, i, v, d,
			frame = this._nextFrame();
		for (i = 0; i < frame.length; i++) {
			v = this.pool[i];
			d = frame[i];
			v.position([d[0] * 10, d[1] * 10, d[2] / 10]);
			v.setColor(zcu.int2rgb(d[3]));
		}
	},
	_nextFrame: function() {
		var i, frames = this.opts.frames,
			frame = frames[this.frame], padded = frame.length + 200;
		if (this.pool.length < padded) {
			this.log("topping off with", padded - this.pool.length, "voxels");
			for (i = this.pool.length; i < padded; i++)
				this.pool.push(this.attach(this._vox(i)));
		}
		if (this.active < frame.length) {
			for (i = this.active; i < frame.length; i++)
				this.pool[i].show();
		} else if (this.active > frame.length) {
			for (i = frame.length; i < this.active; i++)
				this.pool[i].hide();
		}
		this.active = frame.length;
		this.frame = (this.frame + 1) % frames.length;
		return frame;
	},
	_vox: function(i) {
		return {
			name: "v" + i,
			kind: "voxel",
			invisible: true,
			sphereGeometry: true,
			scale: [0.2, 0.2, 0.2]
		};
	},
	assembled: function() {
		this.pool = Object.values(this.voxel);
		this._.built();
	},
	preassemble: function() {
		var i, oz = this.opts, pz = oz.parts, size = oz.size;
		this.log("initializing with", size, "voxels");
		for (i = 0; i < size; i++)
			pz.push(this._vox(i));
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			size: 1600,
			frames: []
		}, this.opts);
		this.frame = 0;
		this.active = 0;
	}
}, zero.core.Thing);