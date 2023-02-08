zero.core.Book = CT.Class({
	CLASSNAME: "zero.core.Book",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts,
			rmat = zero.core.util.randMat,
			coverMat = rmat(oz.cover),
			pageMat = rmat(oz.pages);
		pz.push({
			name: "spine",
			boxGeometry: [6, 16, 1],
			position: [0, 0, 7],
			matinstance: coverMat
		});

		pz.push({
			name: "author",
			thing: "Text",
			vertical: true,
			text: oz.author,
			position: [0, 0, 7]
		});

		pz.push({
			name: "cover1",
			boxGeometry: [1, 16, 12],
			position: [3, 0, 0],
			matinstance: coverMat,
			parts: [{
				name: "title",
				thing: "Text",
				text: oz.name.split(" ").join("\n"),
				position: [0, 0, 0],
				rotation: [0, Math.PI / 2, 0]
			}]
		});

		pz.push({
			name: "cover2",
			boxGeometry: [1, 16, 12],
			position: [-3, 0, 0],
			matinstance: coverMat
		});
		pz.push({
			name: "pages1",
			boxGeometry: [3, 16, 12],
			position: [1, 0, 0],
			matinstance: pageMat
		});
		pz.push({
			name: "pages2",
			boxGeometry: [3, 16, 12],
			position: [-1, 0, 0],
			matinstance: pageMat
		});
	},
	read: function(onfinish) {
		this.open();
		CT.modal.iframe(zero.core.Book.baseurl + this.opts.code, onfinish || this.close);
	},
	open: function() {
		this.cover1.adjust("rotation", "y", -1);
		this.cover2.adjust("rotation", "y", 1);
		this.pages1.adjust("rotation", "y", -1);
		this.pages2.adjust("rotation", "y", 1);
		this.cover1.adjust("position", "x", 8);
		this.cover2.adjust("position", "x", -8);
		this.pages1.adjust("position", "x", 6);
		this.pages2.adjust("position", "x", -6);
		this.spine.adjust("position", "z", 4);
	},
	close: function() {
		["cover1", "cover2", "pages1", "pages2"].forEach(p => this[p].adjust("rotation", "y", 0));
		this.cover1.adjust("position", "x", 3);
		this.cover2.adjust("position", "x", -3);
		this.pages1.adjust("position", "x", 1);
		this.pages2.adjust("position", "x", -1);
		this.spine.adjust("position", "z", 7);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			code: "agesinchaos00veli",
			cover: "red",
			pages: "white",
			author: "author's name"
		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Book.baseurl = "https://archive.org/details/";