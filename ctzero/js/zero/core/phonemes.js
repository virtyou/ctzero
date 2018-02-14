var phonemes = zero.core.phonemes = [{
	phones: ["pau", "sil", "f", "v"],
	target: {
		ah: 0,
		ow: 0,
		ee: 0
	}
}, {
	phones: ["ay"],
	target: {
		ah: 1,
		ow: 0,
		ee: 4
	}
}, {
	phones: ["ah", "aa", "a", "ax", "@"],
	target: {
		ah: 1,
		ow: 0,
		ee: 0
	}
}, {
	phones: ["ae"],
	target: {
		ah: 0.8,
		ow: 0,
		ee: 0
	}
}, {
	phones: ["eh", "E"],
	target: {
		ah: 0.6,
		ow: 0,
		ee: 0.3
	}
}, {
	phones: ["iy", "i", "e", "ih", "y", "ey", "ia"],
	target: {
		ah: 0,
		ow: 0,
		ee: 0.8
	}
}, {
	phones: ["ei", "ai"],
	target: {
		ah: 0.2,
		ow: 0,
		ee: 1
	}
}, {
phones: ["x"],
	target: {
		ah: 0.1,
		ow: 0.1,
		ee: 0
	}
}, {
phones: ["g"],
	target: {
		ah: 0.1,
		ow: 0.1,
		ee: 0
	}
}, {
phones: ["uai"],
	target: {
		ah: 0.1,
		ow: 0.8,
		ee: 0.8
	}
}, {
	phones: ["ao", "ow", "o", "ou", "uo"],
	target: {
		ah: 0.3,
		ow: 1,
		ee: 0
	}
}, {
	phones: ["w", "uw", "u", "iao"],
	target: {
		ah: 0,
		ow: 1,
		ee: 0
	}
}, {
	phones: ["oy", "O"],
	target: {
		ah: 0,
		ow: 0.8,
		ee: 0.2
	}
}, {
	phones: ["m", "b", "p"],
	target: {
		ah: 0,
		ow: 0,
		ee: 0,
		m: 1
	},
	k: {
		ah: 800,
		ow: 800,
		ee: 800
	},
	otherwise: {
		target: {
			m: 0
		},
		k: {
			ah: 350,
			ow: 350,
			ee: 350
		}
	}
}, {
	phones: ["en", "n", "l"],
	target: {
		ah: 0.2,
		ow: 0.2,
		ee: 0
	}
}, {
	phones: ["eng"],
	target: {
		ah: 0.1,
		ow: 0,
		ee: 0.2
	}
}, {
	phones: ["in"],
	target: {
		ah: 0.2,
		ow: 0,
		ee: 0.8
	}
}, {
	phones: ["ang", "ng", "j"],
	target: {
		ah: 0.4,
		ow: 0,
		ee: 0
	}
}, {
	phones: ["k"],
	target: {
		ah: 0.0,
		ow: 0.1,
		ee: 0
	}
}, {
	phones: ["hh", "h"],
	target: {
		ah: 0.5,
		ow: 0,
		ee: 0
	}
}, {
	phones: ["th"],
	target: {
		ah: 0.4,
		ow: 0.2,
		ee: 0
	}
}, {
	phones: ["t", "d",  "dh"],
	target: {
		ah: 0.2,
		ow: 0.1,
		ee: 0
	}
}, {
	phones: ["r", "er"],
	target: {
		ah: 0.2,
		ow: 0.7,
		ee: 0
	}
}, {
	phones: ["s", "z"],
	target: {
		ah: 0.4,
		ow: 0.2,
		ee: 0.4
	}
}, {
	phones: ["zh"],
	target: {
		ah: 0.3,
		ow: 0.2,
		ee: 0.0
	}
}, {
	phones: ["sh", "S"],
	target: {
		ah: 0.1,
		ow: 0.2,
		ee: 0
	}
}, {
	phones: ["c"],
	target: {
		ah: 0.2,
		ow: 0.5,
		ee: 0
	}
}, {
	phones: ["ong"],
	target: {
		ah: 0,
		ow: 0.2,
		ee: 0
	}	
}, {	
	phones: ["t", "d", "dh", "n", "th", "T", "c", "in", "sh", "ong", "zh", "x"],
	target: {
		th: 1
	},
	otherwise: {
		target: {
			th: -0.8
		}
	}
}];
// "ah", "ee", "ow", "ff", "m", "n", "th"
phonemes.forms = {
	ah: {
		k: 350,
		damp: 40,
		morphs: {
			teeth: {
				influence: 1,
				factor: 1.3
			},
			tongue: {
				influence: 1,
				factor: 2.6
			}
		}

	},
	ee: {
		k: 350,
		damp: 60,
		morphs: {
			teeth: {
				influence: 1,
				factor: 0.3
			},
			tongue: {
				influence: 1,
				factor: 0.3
			}
		}
	},
	ow: {
		k: 350,
		damp: 30,
		morphs: {
			teeth: {
				influence: 1,
				factor: 1
			},
			tongue: {
				influence: 1,
				factor: 1
			}
		}
	},
	ff: {
		k: 350,
		damp: 30,
		morphs: {
			teeth: {
				influence: 1,
				factor: 0.4
			},
			tongue: {
				influence: 1,
				factor: 0.3
			}
		}
	},
	m: {
		k: 800,
		damp: 60
	},
	n: {
		k: 350,
		damp: 20
	},
	th: {
		k: 350,
		damp: 40,
		morphs: {
			tongue: {
				influence: 1,
				factor: -1
			}
		}
	}
};