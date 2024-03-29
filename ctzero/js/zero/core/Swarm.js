zero.core.Swarm = CT.Class({
	CLASSNAME: "zero.core.Swarm",
	removables: false,
	tick: function(dts) {
		var zc = zero.core, zcu = zc.util, i, v, d;
		if (!this.pool || (zcu.ticker % 5) || !zc.camera.visible(this.pool[0]))
			return; // wait
		var frame = this._nextFrame();
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
			frame = frames[this.frame], padded = frame.length + this.opts.buffer;
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
			sphereGeometry: 5,
			anchor: this.thring
		};
	},
	_procFrames: function() {
		var f, i, v, av, hbz = this.hardbounds = {
			min: {}, max: {}
		}, zcu = zero.core.util, fz = this.opts.frames;
		for (f of fz) {
			for (i in f) {
				v = f[i];
				f[i] = [v[0] * 10, v[1] * 10, v[2] / 10, zcu.int2rgb(v[3])];
				this.xyz(function(axis, aindex) {
					av = f[i][aindex];
					if (!(axis in hbz.min))
						hbz.min[axis] = hbz.max[axis] = av;
					else {
						hbz.min[axis] = Math.min(hbz.min[axis], av);
						hbz.max[axis] = Math.max(hbz.max[axis], av);
					}
				});
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
		this.thring = new THREE.Object3D();
		for (i = 0; i < size; i++)
			pz.push(this._vox(i));
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			procFrames: true,
			buffer: 400,
			size: 2000,
			frames: []
		}, this.opts);
		if (typeof opts.frames == "string")
			opts.frames = CT.net.get(opts.frames, null, true);
		this.frame = 0;
		this.active = 0;
		opts.procFrames && this._procFrames();
	}
}, zero.core.Thing);