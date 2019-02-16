zero.base.torso = function(opts) {
    opts = CT.merge(opts, zero.base.torso.defaults); // must set defaults!
    return {
        name: "torso",
        morphStack: opts.morphStack,
        springs: zero.base.springs(),
        aspects: zero.base.aspects(),
        tickers: zero.base.tickers(),
        joints: zero.base.joints(),
        key: opts.key,
        texture: opts.texture,
        stripset: opts.stripset,
        matcat: "Phong",
        meshcat: "SkinnedMesh",
        material: {
            color: opts.color,
            morphTargets: false,
            skinning: true,
            emissive: 0,
            alphaTest: 0.5,
            reflectivity: 10,
            shininess: 2
        },
        parts: [{
            name: "looker",
            position: [0, 35, 25],
            cubeGeometry: [1, 1, 5],
            material: {
                color: 0x00ff00,
                visible: false
            }
        }, {
            name: "lookAt",
            position: [0, 35, 55],
            cubeGeometry: [1, 1, 5],
            material: {
                color: 0x00ff00,
                visible: false
            }
        }, {
            name: "chest",
            thing: "Torso",
            meshcat: "SkinnedMesh",
            texture: opts.dress_texture,
            stripset: opts.dress_stripset,
            matcat: opts.dress_matcat,
            //matcat: "Phong",
            repeat: opts.dress_repeat,
//            position: [0, 18.3, 0],
//            position: [0, 19.2, 0],
//            position: [0, 20.25, 0],
//            scale: [1, 0.8, 1],
            material: {
                color: opts.dress_color,
                specular: 0xff3333,
                morphTargets: false,
                skinning: true,
                emissive: 0,
                transparency: true,
                alphaTest: 0.3,
                reflectivity: 0.9,
                shininess: 8,
                metal: false
            },
            parts: [{
                name: "neck",
                parts: [{
                    name: "head",
                    thing: "Head",
                    parts: [{
                        name: "teeth",
                        texture: opts.teeth_texture,
                        stripset: opts.teeth_stripset,
                        position: [0, -9.2, 2.5],
                        material: {
                            color: opts.teeth_color,
                            morphTargets: true
                        },
                        mti: {
                            3: 1
                        }
                    }, {
                        name: "teeth_top",
                        texture: opts.teeth_top_texture,
                        stripset: opts.teeth_top_stripset,
                        position: [0, -9.2, 2.2],
                        material: {
                            color: opts.teeth_top_color,
                            morphTargets: true
                        },
                        mti: {
                            1: 1
                        }
                    }, {
                        name: "tongue",
                        texture: opts.tongue_texture,
                        stripset: opts.tongue_stripset,
                        position: [0, -9.2, 2.5],
                        material: {
                            color: opts.tongue_color,
                            morphTargets: true
                        },
                        mti: {
                            2: 1
                        }
                    }, {
                        name: "hair",
                        texture: opts.hair_texture, // optional...
                        stripset: opts.hair_stripset,
                        //matcat: "Phong",
                        position: [0, -9, 2.4],
                        repeat: [8, 1],
                        material: {
                            color: opts.hair_color,
                            specular: opts.hair_specular,
                            morphTargets: false,
                            emissive: 0,
                            transparency: true,
                            alphaTest: 0.3,
                            reflectivity: 0.9,
                            shininess: 8,
                            metal: false
                        }
                    }, {
                        name: "eyeGroupL",
                        parts: [{
                            name: "eyeL",
                            texture: opts.eye_texture,
                            stripset: opts.eye_stripset,
                            //matcat: "Phong",
                            scale: [0.9, 0.9, 0.9],
                            material: {
                                color: opts.eyeL_color,
                                specular: 0xaaaaff,
                                morphTargets: true,
                                emissive: 0,
                                alphaTest: 0.5,
                                reflectivity: 1000000,
                                metal: false,
                                shininess: 1000
                            }
                        }, {
                            name: "cubeLeyeDummy",
                            cubeGeometry: [1, 1, 10],
                            material: {
                                color: 0x00ff00,
                                visible: false
                            }
                        }]
                    }, {
                        name: "eyeGroupR",
                        parts: [{
                            name: "eyeR",
                            texture: opts.eye_texture,
                            stripset: opts.eye_stripset,
                            //matcat: "Phong",
                            scale: [0.9, 0.9, 0.9],
                            material: {
                                color: opts.eyeR_color,
                                specular: 0xaaaaff,
                                morphTargets: true,
                                emissive: 0,
                                alphaTest: 0.5,
                                reflectivity: 1000000,
                                metal: false,
                                shininess: 1000
                            }
                        }, {
                            name: "cubeReyeDummy",
                            cubeGeometry: [1, 1, 10],
                            material: {
                                color: 0x00ff00,
                                visible: false
                            }
                        }]
                    }]
                }]
            }]
        }]
    };
};