zero.base.body = function(opts) {
    opts = CT.merge(opts, zero.base.body.defaults); // must set defaults!
    return {
        name: "body",
        texture: opts.texture,
        stripset: opts.stripset,
        matcat: "Phong",
        meshcat: "SkinnedMesh",
        material: {
            skinning: true
        },
        parts: [{
            name: "head",
            thing: "Head",
            matcat: "Phong",
            meshcat: "SkinnedMesh",
            texture: opts.head_texture,
            stripset: opts.head_stripset,
            material: {
                skinning: true
            },
            parts: [{
                name: "eyeL",
                kind: "eye",
                bone: 5,
                texture: opts.eye_texture,
                stripset: opts.eye_stripset
            }, {
                name: "eyeR",
                kind: "eye",
                bone: 6,
                texture: opts.eye_texture,
                stripset: opts.eye_stripset
            }, {
                name: "teeth",
                kind: "facial",
                bone: 4,
                position: [0, -10, 2],
                texture: opts.teeth_texture,
                stripset: opts.teeth_stripset,
                material: {
                    morphTargets: true
                },
                mti: {
                    1: 1
                }
            }, {
                name: "teeth_top",
                kind: "facial",
                bone: 4,
                position: [0, -10, 2],
                texture: opts.teeth_texture,
                stripset: opts.teeth_stripset
            }, {
                name: "tongue",
                kind: "facial",
                bone: 4,
                position: [0, -10, 2],
                texture: opts.teeth_texture,
                stripset: opts.teeth_stripset,
                material: {
                    morphTargets: true
                },
                mti: {
                    2: 1
                }
            }, CT.merge(opts.hair, {
                kind: "hair",
                bone: 4
            })]
        }]
    };
};

zero.base.body.hair = {
    afro: {
        strand: {
            flex: Math.PI / 32,
            taper: [1.4, 1, 1.4],
            girth: 4,
            length: 4,
            segments: 3
        }
    },
    aragorn: {
        density: 8,
        strand: {
            girth: 2,
            length: 2,
            segments: 4,
            flex: Math.PI / 4,
            taper: [0.8, 1.5, 1.2]
        }
    },
    braids: {
        strand: {
            length: 3,
            girth: 1.2,
            segments: 6,
            kink: Math.PI / 8
        }
    },
    buzz: {
        noTick: true,
        density: 20,
        strand: {
            length: 1,
            girth: 0.1,
            segments: 1,
            flex: Math.PI / 32
        }
    },
    eighties: {
        strand: {
            kink: Math.PI / 2,
            taper: [0.7, 0.9, 1]
        }
    },
    mohawk: {
        coverage: [1, 0.2],
        strand: {
            flex: Math.PI / 32
        }
    },
    medusa: {
        density: 4,
        strand: {
            kink: Math.PI,
            girth: 4,
            length: 8,
            segments: 10,
            flex: Math.PI / 16,
            drag: 0.9,
            damp: 1.1,
            veldamp: 1000
        }
    }
};

zero.base.body.beard = {
    santa: {
        strand: {
            taper: [1.1, 0.9, 1.1]
        }
    },
    stubble: {
        noTick: true,
        density: 20,
        strand: {
            hard: true,
            length: 0.5,
            girth: 0.05,
            segments: 1,
            flex: Math.PI / 32
        }
    }
};

zero.base.body.tail = {
    horse: {
        strand: {
            girth: 0.2,
            taper: [1, 1, 1]
        }
    },
    lizard: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            girth: 6,
            hard: true,
            wiggle: 60,
            nograv: true,
            flex: Math.PI / 16
        }
    },
    cat: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            girth: 6,
            hard: true,
            wiggle: 60,
            nograv: true,
            flex: Math.PI / 8,
            taper: [0.9, 0.9, 0.9]
        }
    },
    dog: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            girth: 6,
            length: 10,
            hard: true,
            wiggle: 60,
            nograv: true,
            flex: Math.PI / 8
        }
    },
    sheep: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            girth: 6,
            segments: 3,
            hard: false,
            wiggle: 60,
            nograv: false,
            flex: Math.PI / 8
        }
    },
    pig: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            girth: 2,
            segments: 10,
            length: 2,
            hard: true,
            wiggle: 60,
            curl: [1, 0],
            nograv: true,
            flex: Math.PI / 8
        }
    },
    bunny: {
        density: 0.1,
        range: Math.PI / 16,
        strand: {
            segments: 1,
            length: 2,
            hard: true,
            wiggle: 60,
            nograv: true,
            flex: Math.PI / 8
        }
    },
    chicken: {
        range: Math.PI / 16,
        coverage: [0.1, 1],
        strand: {
            segments: 2,
            length: 10,
            hard: true,
            nograv: true,
            curl: [1, 0],
            flex: Math.PI / 8
        }
    }
};