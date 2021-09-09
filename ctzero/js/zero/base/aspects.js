zero.base.aspects = {};
zero.base.aspects.head = function() {
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
                blink: 1
            }
        },
        brow: {
            springs: {
                brow: 1
            }
        },
        browAsym: {
            springs: {
                browAsym: 1
            }
        },
        browSad: {
            springs: {
                browSad: 1
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
        smileEyes: {
            min: 0,
            max: 1,
            springs: {
                smileEyes: 1, // multiplier
            },
//            aspects: {
  //              bigSmile: -1
    //        }
        },
        bigSmile: {
            min: 0,
            springs: {
                bigSmile: 0.8
            },
       //     aspects: {
//                ah: -1,
  //              ee: -1,
    //            m: -1,
      //          frown: -1,
        //        smile: -0.4
         //   }
        },
        smile: {
            min: 0,
            springs: {
                smile: 1
            },
//            aspects: {
  //              bigSmile: -1
    //        }
        }
    };
};

zero.base.aspects.spine = {
    pelvis: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    },
    lumbar: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    },
    ribs: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    },
    neck: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    },
    head: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    }
};
zero.base.aspects.leg = {
    hip: {
        x: {
            max: 0,
            min: -2,
            bsprings: {
                bow: -0.5
            }
        },
        y: {
            max: 1,
            min: -1
        },
        z: {
            max: 0,
            min: -2
        }
    },
    knee: {
        x: {
            max: 2,
            min: 0,
            bsprings: {
                bow: 1
            }
        }
    },
    ankle: {
        x: {
            max: 0.5,
            min: -0.5,
            bsprings: {
                bow: -0.4
            }
        },
        y: {
            max: 0.5,
            min: -0.5
        }
    },
    toe: {
        x: {
            max: 0.5,
            min: -0.5,
            bsprings: {
                bow: -0.4
            }
        }
    }
};
zero.base.aspects.arm = {
    clavicle: {
        y: {
            max: 0.5,
            min: -0.5
        },
        z: {
            max: 0.2,
            min: -0.5
        }
    },
    shoulder: {
        x: {
            max: 1,
            min: -3
        },
        y: {
            max: 0.5,
            min: -0.5
        },
        z: {
            max: 1,
            min: -2
        }
    },
    elbow: {
        x: {
            max: 0,
            min: -2
        },
        y: {
            max: 1,
            min: -1
        }
    },
    wrist: {
        x: {
            max: 0.5,
            min: -0.5
        },
        z: {
            max: 1,
            min: -1
        }
    }
};
zero.base.aspects.hand = {}; // filled out in core.Hand