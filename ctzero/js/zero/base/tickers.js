zero.base.tickers = function() {
    return {
        asym: {
            talking: { // condition -- should only be one
                yes: {
                    reschedule: 0.5,
                    target: {
                        base: -0.6,
                        coefficient: 1.2
                    }
                },
                no: {
                    reschedule: 3,
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
                    reschedule: 0.5,
                    target: {
                        coefficient: 2.4
                    }
                },
                no: {
                    reschedule: 2,
                    target: {
                        base: 0.3,
                        coefficient: -0.6
                    }
                }
            }
        },
        lids: {
            talking: {
                yes: {
                    reschedule: 2,
                    boost: {
                        smileEyes: {
                            base: -0.1,
                            coefficient: 0.4
                        }
                    },
                    k: {
                        base: 220
                    }
                },
                no: {
                    reschedule: 5,
                    boost: {
                        smileEyes: {
                            coefficient: 0.2
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
                    reschedule: 3,
                    target: {
                        base: -0.6,
                        coefficient: 1.6
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
                        base: 200
                    }
                },
                no: {
                    reschedule: 4,
                    target: {
                        coefficient: 1
                    },
                    k: {
                        base: 70
                    }
                }
            }
        },
        browAsym: {
            talking: {
                yes: {
                    reschedule: 4,
                    target: {
                        base: -1,
                        coefficient: 2
                    }
                },
                no: {
                    reschedule: 7,
                    target: {
                        base: -0.8,
                        coefficient: 1.6
                    }
                }
            }
        },
        sad_brow: {
            talking: {
                yes: {
                    reschedule: 4,
                    target: {
                        base: 0,
                        coefficient: 0.1
                    }
                },
                no: {
                    reschedule: 7,
                    target: {
                        base: 0,
                        coefficient: 0.2
                    }
                }
            }
        },
        nod: {
            talking: {
                once: true,
                yes: {
                    reschedule: 2,
                    target: {
                        base: 30,
                        coefficient: -60
                    },
                    k: {
                        base: 60
                    }
                },
                no: {
                    reschedule: 4,
                    target: {
                        base: 0.2,
                        coefficient: -0.4
                    }
                }
            }
        },
        shake: {
            talking: {
                once: true,
                yes: {
                    reschedule: 6,
                    target: {
                        base: -6,
                        coefficient: 12
                    }
                },
                no: {
                    reschedule: 8,
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    }
                }
            }
        },
        tilt: {
            talking: {
                once: true,
                yes: {
                    reschedule: 4,
                    k: {
                        base: 20
                    },
                    target: {
                        base: -0.2,
                        coefficient: 0.4
                    }
                },
                no: {
                    reschedule: 7,
                    k: {
                        base: 10
                    },
                    target: {
                        base: -0.1,
                        coefficient: 0.2
                    }
                }
            }
        },
        bow: {
            talking: {
                once: true,
                yes: {
                    reschedule: 3,
                    target: {
                        base: 0.2,
                        coefficient: -0.4
                    }
                },
                no: {
                    reschedule: 6,
                    target: {
                        base: 0.1,
                        coefficient: -0.2
                    }
                }
            }
        },
        twist: {
            talking: {
                once: true,
                yes: {
                    reschedule: 8,
                    target: {
                        base: -0.6,
                        coefficient: 1.2
                    }
                },
                no: {
                    reschedule: 10,
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
                    reschedule: 7,
                    k: {
                        base: 20
                    },
                    target: {
                        base: -0.1,
                        coefficient: 0.2
                    }
                },
                no: {
                    reschedule: 9,
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