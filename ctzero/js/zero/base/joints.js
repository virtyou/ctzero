zero.base.joints = function() {
    return [{
        name: "pelvis",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    bow: 1,
                    nod: 0.2
                }
            },
            y: {
                unbounded: true,
                bsprings: {
                    orientation: 1,
                    twist: 0.5,
                    shake: 0.3
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    lean: 1,
                    tilt: -0.2
                }
            }
        }
    }, {
        name: "torso",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    nod: 0.5,
                    ah: -0.004,
                    ee: 0.004
                }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    shake: 0.5,
                    ow: -0.004,
                    n: -0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
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
                bsprings: {
                    nod: 0.5,
                    ah: -0.004,
                    ee: 0.004
                }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    shake: 0.5,
                    ow: -0.004,
                    n: 0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    tilt: 0.5,
                    ow: -0.004,
                    n: 0.004
                }
            }
        }
    }];
};