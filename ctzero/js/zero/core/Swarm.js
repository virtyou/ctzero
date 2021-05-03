zero.core.Swarm = CT.Class({
	CLASSNAME: "zero.core.Swarm",
	tick: function(dts) {
		if (!this.pool || (zero.core.util.ticker % 2)) return; // wait
		var zcu = zero.core.util, i, v, d,
			frame = this._nextFrame();
		for (i = 0; i < frame.length; i++) {
			v = this.pool[i];
			d = frame[i];
			v.position(d);
			v.setColor(d[3]);
		}
		this.tickPos();
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
	_procFrames: function() {
		var f, i, v, fz = this.opts.frames, zcu = zero.core.util;
		for (f of fz) {
			for (i in f) {
				v = f[i];
				f[i] = [v[0] * 10, v[1] * 10, v[2] / 10, zcu.int2rgb(v[3])];
			}
		}
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
			procFrames: true,
			size: 1600,
			frames: []
		}, this.opts);
		if (typeof opts.frames == "string")
			opts.frames = CT.net.get(opts.frames, null, true);
		this.frame = 0;
		this.active = 0;
		opts.procFrames && this._procFrames();
	}
}, zero.core.Thing);