zero.base.joints = function() {
    return [{
        name: "torso",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                springs: {
                    bow: 1,
                    nod: 0.2
                }
            },
            y: {
                unbounded: true,
                springs: {
                    twist: 1,
                    shake: 0.3
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                springs: {
                    lean: 1,
                    tilt: -0.2
                }
            }
        }
    }, {
        name: "chest",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                springs: {
                    nod: 0.5,
                    ah: -0.004,
                    ee: 0.004
                }
            },
            y: {
                max: 0.5,
                min: -0.5,
                springs: {
                    shake: 0.5,
                    ow: -0.004,
                    n: -0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                springs: {
                    tilt: 0.5,
                    ow: -0.004,
                    n: -0.004
                }
            }
        }
    }, {
        name: "neck",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                springs: {
                    nod: 0.5,
                    ah: -0.004,
                    ee: 0.004
                }
            },
            y: {
                max: 0.5,
                min: -0.5,
                springs: {
                    shake: 0.5,
                    ow: -0.004,
                    n: 0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                springs: {
                    tilt: 0.5,
                    ow: -0.004,
                    n: 0.004
                }
            }
        }
    }];
};