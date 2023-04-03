zero.base.springs = {};
zero.base.springs.body = function() {
    var cfg = core.config.ctzero;
    return {
        theta: {
            k: 20,
            damp: 5,
            bounds: {
                min: -1,
                max: 1
            }
        },
        phi: {
            k: 20,
            damp: 5
        },
        bob: {
            k: 10,
            damp: 5,
            hard: true,
            floory: true,
            acceleration: -1000,
            floored: !cfg.gravity
        },
        weave: {
            k: 10,
            damp: 5,
            ebound: true,
            rdts: cfg.multi
        },
        slide: {
            k: 10,
            damp: 5,
            ebound: true,
            rdts: cfg.multi
        },

        orientation: {
            k: 20,
            damp: 20
        },

        twist: {
            k: 20,
            damp: 20,
            breaks: true
        },
        bow: {
            k: 20,
            damp: 20,
            breaks: true
        },
        lean: {
            k: 20,
            damp: 30
        },

        shake: {
            k: 20,
            damp: 10,
            bounds: {
                min: -1,
                max: 1
            }
//            breaks: true
        },
        nod: {
            k: 4,
            damp: 2,
            bounds: {
                min: -1,
                max: 1
            }
//            breaks: true
        },
        tilt: {
            k: 50,
            damp: 5
        }
    };
};

zero.base.springs.arm = {
    elbow: {
        k: 40,
        damp: 10,
        noslow: true
    },
    shoulder: {
        k: 20,
        damp: 80,
        noslow: true
    },
    clavicle: {
        k: 20,
        damp: 40,
        noslow: true
    }
};

zero.base.springs.head = function() {
    return {
        asym: {
            k: 20,
            damp: 10
        },
        smileEyes: {
            k: 20,
            damp: 10
        },
        blink: {
            k: 40,
            damp: 5
        },
        smile: {
            k: 20,
            damp: 10
        },
        bigSmile: {
            k: 20,
            damp: 10
        },
        brow: {
            k: 20,
            damp: 10
        },
        browAsym: {
            k: 20,
            damp: 10
        },
        browSad: {
            k: 20,
            damp: 10
        },
        frown: {
            k: 20,
            damp: 10
        }
    };
};