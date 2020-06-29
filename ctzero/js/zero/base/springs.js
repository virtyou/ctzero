zero.base.springs = {};
zero.base.springs.body = function() {
    return {
        bob: {
            k: 10,
            damp: 5,
            hard: !core.config.ctzero.room.gravity,
            floory: true,
            floored: true,
            acceleration: -0.5
        },
        weave: {
            k: 10,
            damp: 5
        },
        slide: {
            k: 10,
            damp: 5
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
            damp: 10
//            breaks: true
        },
        nod: {
            k: 4,
            damp: 2
//            breaks: true
        },
        tilt: {
            k: 50,
            damp: 5
        }
    };
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
            k: 2000,
            damp: 40
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