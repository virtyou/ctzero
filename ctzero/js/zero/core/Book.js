zero.core.Book = CT.Class({
	CLASSNAME: "zero.core.Book",
	preassemble: function() {
		var oz = this.opts, pz = oz.parts,
			rmat = zero.core.util.randMat,
			coverMat = rmat(oz.cover),
			pageMat = rmat(oz.pages);
		pz.push({
			name: "spine",
			kind: "cover",
			boxGeometry: [6, 16, 1],
			position: [0, 0, 6],
			matinstance: coverMat,
			parts: [{
				name: "author",
				thing: "Text",
				vertical: true,
				text: oz.author,
				position: [0, 0, 0]
			}]
		});

		pz.push({
			name: "front",
			kind: "cover",
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
			name: "back",
			kind: "cover",
			boxGeometry: [1, 16, 12],
			position: [-3, 0, 0],
			matinstance: coverMat
		});
		pz.push({
			name: "half1",
			kind: "pages",
			boxGeometry: [3, 16, 12],
			position: [1, 0, 0],
			matinstance: pageMat
		});
		pz.push({
			name: "half2",
			kind: "pages",
			boxGeometry: [3, 16, 12],
			position: [-1, 0, 0],
			matinstance: pageMat
		});
	},
	readbutt: function() {
		return CT.dom.button("read", () => zero.core.current.person.touch(this, this.read));
	},
	read: function(onfinish) {
		this.open();
		CT.modal.iframe(zero.core.Book.baseurl + this.opts.code, onfinish || this.close);
	},
	open: function() {
		this.front.adjust("rotation", "y", -1);
		this.back.adjust("rotation", "y", 1);
		this.half1.adjust("rotation", "y", -1);
		this.half2.adjust("rotation", "y", 1);
		this.front.adjust("position", "x", 8);
		this.back.adjust("position", "x", -8);
		this.half1.adjust("position", "x", 6);
		this.half2.adjust("position", "x", -6);
		this.spine.adjust("position", "z", 4);
	},
	close: function() {
		["front", "back", "half1", "half2"].forEach(p => this[p].adjust("rotation", "y", 0));
		this.front.adjust("position", "x", 3);
		this.back.adjust("position", "x", -3);
		this.half1.adjust("position", "x", 1);
		this.half2.adjust("position", "x", -1);
		this.spine.adjust("position", "z", 6);
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