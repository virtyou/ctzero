zero.core.click = {
    targets: [],
    init: function() {
        // adapted from: https://stemkoski.github.io/Three.js/Mouse-Click.html
        var zc = zero.core, click = zc.click;
        if (click._ready) return;
        click._ready = true;
        var mouse = {}, cam = zc.camera.get(),
            can = document.getElementsByTagName("canvas")[0],
            offset = CT.align.offset(can), vector, ray, intersects, i;
        CT.gesture.listen("tap", CT.dom.id("vnode") || CT.dom.id("ctmain"), function(tapCount, pos) {
            mouse.x = ((pos.x - offset.left) / can.clientWidth) * 2 - 1;
            mouse.y = -((pos.y - offset.top) / can.clientHeight) * 2 + 1;

            vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(cam);
            ray = new THREE.Raycaster(cam.position, vector.sub(cam.position).normalize());
            intersects = ray.intersectObjects(click.targets, true);

            for (i = 0; i < intersects.length; i++) {
                var obj = intersects[i].object;
                while (obj) {
                    if (obj.__click && !obj.__click())
                        return;
                    obj = obj.parent;
                }
            }

            zc.current.controls && zc.current.controls.tap(pos);
        });
    },
    target: function(thing) {
        return thing.group || thing.thring || thing.bone;
    },
    trigger: function(thing) {
        zero.core.click.target(thing).__click();
    },
    unregister: function(thing) {
        var c = zero.core.click;
        CT.data.remove(c.targets, c.target(thing));
    },
    register: function(thing, cb) {
        var c = zero.core.click;
        c.init();
        var target = c.target(thing);
        target.__click = cb;
        c.targets.includes(target) || c.targets.push(target);
    }
};