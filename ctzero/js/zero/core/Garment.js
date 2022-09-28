zero.core.Garment = CT.Class({
	CLASSNAME: "zero.core.Garment",
	preassemble: function() {

	},
	init: function(opts) {
		var bodpart = this.opts.bodpart = this.opts.kind.split("_").pop();
		this.opts = opts = CT.merge(opts, zero.base.clothes[bodpart], {

		}, this.opts);
	}
}, zero.core.Thing);

zero.core.Garment.Cloth = CT.Class({
	CLASSNAME: "zero.core.Garment.Cloth",
	preassemble: function() {
		
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {

		}, this.opts);
	}
}, zero.core.Thing);