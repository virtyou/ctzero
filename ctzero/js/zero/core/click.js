zero.core.click = {
    targets: [],
    init: function() {
        // adapted from: https://stemkoski.github.io/Three.js/Mouse-Click.html
        if (zero.core.click._ready) return;
        zero.core.click._ready = true;
        var mouse = {}, projector = new THREE.Projector(),
            cam = zero.core.camera.get(), vector, ray, intersects, i,
            can = document.getElementsByTagName("canvas")[0],
            offset = CT.align.offset(can);
        can.parentNode.addEventListener(CT.info.mobile
            ? 'touchstart' : 'mousedown', function(e) {
            mouse.x = ((e.clientX - offset.left) / can.clientWidth) * 2 - 1;
            mouse.y = -((e.clientY - offset.top) / can.clientHeight) * 2 + 1;

            vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            projector.unprojectVector(vector, cam);
            ray = new THREE.Raycaster(cam.position, vector.sub(cam.position).normalize());
            intersects = ray.intersectObjects(zero.core.click.targets, true);

            for (i = 0; i < intersects.length; i++) {
                var obj = intersects[i].object;
                while (obj) {
                    if (obj.__click && !obj.__click())
                        return;
                    obj = obj.parent;
                }
            }
        });
    },
    target: function(thing) {
        return thing.group || thing.thring || thing.bone;
    },
    trigger: function(thing) {
        zero.core.click.target(thing).__click();
    },
    register: function(thing, cb) {
        zero.core.click.init();
        var target = zero.core.click.target(thing);
        target.__click = cb;
        zero.core.click.targets.push(target);
    }
};