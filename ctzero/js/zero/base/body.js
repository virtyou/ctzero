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