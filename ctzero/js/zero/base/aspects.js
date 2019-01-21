zero.base.aspects = function() {
    return {
        ah: {
            springs: {
                ah: 1.3
            }
        },
        w: {
            springs: {
                ow: 1
            }
        },
        ee: {
            springs: {
                ee: 0.6
            }
        },
        ff: {
            springs: {
                ff: 0.8
            }
        },
        m: {
            springs: {
                m: 1
            }
        },
        blink: {
            min: 0,
            max: 0.8,
            springs: {
                lids: 1
            }
        },
        brow: {
            springs: {
                brow: 1
            }
        },
        brow_asym: {
            springs: {
                browAsym: 1
            }
        },
        sad_brow: {
            springs: {
                sad_brow: 1
            }
        },
        frown: {
            springs: {
                frown: 1
            }
        },
        asym: {
            springs: {
                asym: 1
            }
        },
        smile_eye: {
            min: 0,
            max: 1,
            springs: {
                smileEyes: 1, // multiplier
            },
            aspects: {
                big_smile: -1
            }
        },
        big_smile: {
            min: 0,
            springs: {
                bigSmile: 0.8
            },
            aspects: {
                ah: -1,
                ee: -1,
                m: -1,
                frown: -1,
                smile: -0.4
            }
        },
        smile: {
            min: 0,
            springs: {
                smile: 1
            },
            aspects: {
                big_smile: -1
            }
        }
    };
};