zero.core.Appliance.Computer = CT.Class({
	CLASSNAME: "zero.core.Appliance.Computer",
	messages: [],
	do: function(order) { // {program,data}
		if (!this.power) return this.log("do(", order, ") aborted - no power!");
		const program = order.program, data = order.data;
		data.startsWith("tlchan:") || CT.event.emit("program", {
			name: this.name, // tlchan->zcu.videoTexture()
			program: program,
			data: data.replace("fzn:up:", "fzn:")
		});
		this.setProgram(program, data);
	},
	setProgram: function(program, data) {
		this.opts.program = program;
		this.opts.data = data;
		this[program](data);
	},
	uncur: function() {
		this.screen.curprog && this.screen.detach("curprog");
	},
	setcur: function(copts, nogeo) {
		const uncur = this.uncur, screen = this.screen, bopts = {
			name: "curprog",
			comp: this.name,
			position: [0, 0, 1]
		}, setter = function() {
			uncur();
			screen.attach(CT.merge(copts, bopts), null, true);
		}, curprog = screen.curprog;
		if (!nogeo)
			bopts.planeGeometry = this.opts.screenDims;
		curprog ? curprog.onReady(setter) : setter();
	},
	video: function(data) { // supports "fzn:" and "fzn:up:" vlinx
		this.setcur({ video: data });
	},
	vstrip: function(data) {
		this.setcur({ vstrip: data });
	},
	screenSaver: function(vsname) { // TODO : avoid direct one references here and elsewhere
		this.vstrip("templates.one.vstrip." + vsname);
	},
	text: function(data) {
		this.setcur({
			center: false,
			thing: "Text",
			text: data.split(" ").join("\n"),
			material: {
				color: this.opts.textColor
			}
		}, true);
	},
	message: function(data) {
		this.text(data);
		this.messages.push(data);
	},
	browse: function() {
		const mz = this.messages, ml = mz.length,
			msg = "you have " + ml + " messages";
		this.text(msg);
		ml && CT.modal.choice({
			prompt: msg,
			data: mz,
			cb: this.text
		});
	},
	use: function() {
		zero.core.Appliance.Computer.selectors.program(this.do, this.browse);
	},
	preassemble: function() {
		const oz = this.opts;
		oz.parts.push({
			name: "screen",
			planeGeometry: oz.screenDims,
			position: oz.screenPos,
			material: {
				color: oz.screenColor
			}
		});
		oz.keyboard && this.buildKeyboard();
	},
	_keyrow: function(z) {
		const pz = [];
		for (let x = -9; x <= 9; x += 3) {
			pz.push({
				position: [x, 1, z],
				boxGeometry: [2, 1, 2]
			});
		}
		return { parts: pz };
	},
	buildKeyboard: function() {
		this.opts.parts.push({
			name: "keyboard",
			boxGeometry: [22, 2, 10],
			position: [0, 0, 20],
			parts: [-3, 0, 3].map(this._keyrow)
		});
	},
	start: function() {
		const oz = this.opts;
		if (oz.screenSaver) {
			oz.program = "screenSaver";
			oz.data = oz.screenSaver;
		}
		oz.program && oz.data && this.do(oz);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			data: null,   // ""
			program: null // video|vstrip|screenSaver|text|message|?
		}, this.opts, {
			keyboard: true,
			screenPos: [0, 0, 0],
			screenDims: [14, 18],
			screenColor: 0x000000,
			textColor: 0x00ff00
		});
		this.onReady(this.start);
	}
}, zero.core.Appliance);

zero.core.Appliance.Computer.selectors = {
	prompt: function(prop, data, cb) {
		CT.modal.choice({
			prompt: "what's the " + prop + "?",
			data: data,
			cb: cb
		});
	},
	program: function(cb, browser) {
		const csz = zero.core.Appliance.Computer.selectors,
			ops = ["video", "screenSaver", "message"];
		browser && ops.push("browse");
		csz.prompt("program", ops, function(program) {
			let cbwrap = data => cb({ program: program, data: data });
			if (program == "message") {
				CT.modal.prompt({
					prompt: "what's the message?",
					cb: cbwrap
				});
			} else if (program == "screenSaver") // TODO : avoid direct one reference!
				csz.prompt("screenSaver", Object.keys(templates.one.vstrip), cbwrap);
			else if (program == "browse")
				browser();
			else // video
				zero.core.util.vidProg(cbwrap);
		});
	}
};