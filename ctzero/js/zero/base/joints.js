zero.base.joints = function() {
    return [{
        name: "pelvis",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    bow: 0.2,
  //                  nod: -0.2
                }
            },
            y: {
                unbounded: true,
                bsprings: {
//                    orientation: 1,
                    twist: 0.5,
      //              shake: -0.3
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
        name: "lumbar",
        rotation: {
            x: {
                max: Math.PI / 2,
                min: -0.5,
                waves: {
                    breath: {
                        amp: 0.05,
                        segs: 200
                    }
                },
                bsprings: {
                    bow: 1,
//                    nod: -0.5
                },
//                hsprings: {
  //                  ah: -0.000000000000004,
    //                ee: 0.000000000000004
      //          }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    twist: 0.1
//                    shake: -0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: -0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    tilt: -0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: -0.004
                }
            }
        }
    }, {
        name: "ribs",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                waves: {
                    breath: {
                        amp: 0.05,
                        segs: 200
                    }
                },
                bsprings: {
//                    nod: 0.5
                    bow: 0.1
                },
//                hsprings: {
  //                  ah: -0.000000000000004,
    //                ee: 0.000000000000004
      //          }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
//                    shake: 0.5
                    twist: 0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: -0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    tilt: 0.5
                },
                hsprings: {
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
                    nod: 0.5
                },
//                hsprings: {
  //                  ah: -0.000000000000000004,
    //                ee: 0.000000000000000004
      //          }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    shake: 0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: 0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    tilt: 0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: 0.004
                }
            }
        }
    }, {
        name: "head",
        rotation: {
            x: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    nod: 0.5
                },
//                hsprings: {
  //                  ah: -0.000000000000000004,
    //                ee: 0.000000000000000004
      //          }
            },
            y: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    shake: 0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: 0.004
                }
            },
            z: {
                max: 0.5,
                min: -0.5,
                bsprings: {
                    tilt: 0.5
                },
                hsprings: {
                    ow: -0.004,
                    n: 0.004
                }
            }
        }
    }];
};