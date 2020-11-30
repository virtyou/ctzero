zero.base.tickers = {};
zero.base.tickers.body = function() {
    return {
        nod: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 0,
                        coefficient: 0.2
                    },
                    target: {
                        base: 0.2,
                        coefficient: -0.4
                    },
                    k: {
                        base: 25
                    },
                    damp: {
                        base: 13
                    }
                },
                no: {
                    reschedule: {
                        base: 2,
                        coefficient: 2
                    },
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    },
                    k: {
                        base: 10
                    },
                    damp: {
                        base: 5
                    }
                }
            }
        },
        shake: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 0,
                        coefficient: 3
                    },
                    target: {
                        base: 0.4,
                        coefficient: -0.8
                    },
                    k: {
                        base: 10
                    },
                    damp: {
                        base: 5
                    }
                },
                no: {
                    reschedule: {
                        base: 4,
                        coefficient: 4
                    },
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    },
                    k: {
                        base: 10
                    },
                    damp: {
                        base: 5
                    }
                }
            }
        },
        tilt: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 0,
                        coefficient: 2
                    },
                    k: {
                        base: 20
                    },
                    target: {
                        base: -0.3,
                        coefficient: 0.6
                    }
                },
                no: {
                    reschedule: {
                        base: 0,
                        coefficient: 6
                    },
                    k: {
                        base: 10
                    },
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    }
                }
            }
        },
        bow: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 1.5,
                        coefficient: 1.5
                    },
                    target: {
                        base: 0.08,
                        coefficient: -0.16
                    }
                },
                no: {
                    reschedule: {
                        base: 3,
                        coefficient: 3
                    },
                    target: {
                        base: 0.06,
                        coefficient: -0.12
                    }
                }
            }
        },
        twist: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 4,
                        coefficient: 4
                    },
                    target: {
                        base: -0.6,
                        coefficient: 1.2
                    }
                },
                no: {
                    reschedule: {
                        base: 5,
                        coefficient: 5
                    },
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    }
                }
            }
        },
        lean: {
            talking: {
                once: true,
                yes: {
                    reschedule: {
                        base: 3.5,
                        coefficient: 3.5
                    },
                    k: {
                        base: 10
                    },
                    target: {
                        base: -0.05,
                        coefficient: 0.1
                    }
                },
                no: {
                    reschedule: {
                        base: 4.5,
                        coefficient: 4.5
                    },
                    k: {
                        base: 10
                    },
                    target: {
                        base: -0.05,
                        coefficient: 0.1
                    }
                }
            }
        }
    };
};

zero.base.tickers.head = function() {
    return {
        asym: {
            talking: { // condition -- should only be one
                yes: {
                    reschedule: {
                        base: 0.5,
                        coefficient: 0.5
                    },
                    target: {
                        base: -0.6,
                        coefficient: 1.2
                    }
                },
                no: {
                    reschedule: {
                        base: 1.5,
                        coefficient: 1.5
                    },
                    target: {
                        base: -0.5,
                        coefficient: 1
                    }
                }
            }
        },
        smileEyes: {
            talking: {
                yes: {
                    reschedule: {
                        base: 0.5,
                        coefficient: 0.5
                    },
                    target: {
                        coefficient: 2.4
                    }
                },
                no: {
                    reschedule: {
                        base: 0,
                        coefficient: 1
                    },
                    target: {
                        base: -0.5,
                        coefficient: 1
                    }
                }
            }
        },
        blink: {
            talking: {
                yes: {
                    reschedule: {
                        coefficient: 3
                    },
                    boost: {
                        smileEyes: {
                            base: -0.1,
                            coefficient: 0.4
                        }
                    },
                    value: {
                        base: 1
                    }
                },
                no: {
                    reschedule: {
                        base: 2,
                        coefficient: 4
                    },
                    value: {
                        base: 1
                    },
                    boost: {
                        smileEyes: {
                            coefficient: -0.2
                        }
                    }
                }
            }
        },
        smile: {
            talking: {
                yes: {
                    target: {
                        coefficient: 0.7
                    }
                },
                no: {
                    reschedule: {
                        base: 1.5,
                        coefficient: 1.5
                    },
                    target: {
                        base: 0,
                        coefficient: 1
                    }
                }
            }
        },
        bigSmile: {
            talking: {
                yes: {
                    target: {
                        coefficient: 0.7
                    }
                },
                no: {
                    reschedule: {
                        base: 0,
                        coefficient: 1
                    },
                    target: {
                        base: 0,
                        coefficient: 0
                    }
                }
            }
        },
        brow: {
            talking: {
                yes: {
                    target: {
                        base: -0.3,
                        coefficient: 0.7
                    },
                    k: {
                        base: 10
                    }
                },
                no: {
                    reschedule: {
                        base: 2,
                        coefficient: 2
                    },
                    target: {
                        base: 0,
                        coefficient: 1
                    },
                    k: {
                        base: 20
                    }
                }
            }
        },
        browAsym: {
            talking: {
                yes: {
                    reschedule: {
                        base: 2,
                        coefficient: 2
                    },
                    target: {
                        base: -1,
                        coefficient: 2
                    }
                },
                no: {
                    reschedule: {
                        base: 3.5,
                        coefficient: 3.5
                    },
                    target: {
                        base: -0.8,
                        coefficient: 1.6
                    }
                }
            }
        },
        browSad: {
            talking: {
                yes: {
                    reschedule: {
                        base: 2,
                        coefficient: 2
                    },
                    target: {
                        base: 0,
                        coefficient: 0.1
                    }
                },
                no: {
                    reschedule: {
                        base: 0,
                        coefficient: 3
                    },
                    target: {
                        base: 0,
                        coefficient: 0.2
                    }
                }
            }
        },
        frown: {
            talking: {
                yes: {
                    reschedule: {
                        base: 0.5,
                        coefficient: 0.5
                    },
                    target: {
                        coefficient: 2.4
                    }
                },
                no: {
                    reschedule: {
                        base: 0,
                        coefficient: 1
                    },
                    target: {
                        base: -0.1,
                        coefficient: 0.2
                    }
                }
            }
        }
    };
};