zero.core.click = {
    targets: [],
    init: function() {
        // adapted from: https://stemkoski.github.io/Three.js/Mouse-Click.html
        if (zero.core.click._ready) return;
        zero.core.click._ready = true;
        var mouse = {}, projector = new THREE.Projector(),
            cam = zero.core.camera.get(), vector, ray, intersects, i;
        document.getElementsByTagName("canvas")[0].parentNode.addEventListener(CT.info.mobile
            ? 'touchstart' : 'mousedown', function(e) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            projector.unprojectVector(vector, cam);
            ray = new THREE.Raycaster(cam.position, vector.sub(cam.position).normalize());
            intersects = ray.intersectObjects(zero.core.click.targets, true);

            for (i = intersects.length - 1; i > -1; i--) {
                var obj = intersects[i].object;
                while (obj) {
                    if (obj.__click)
                        return obj.__click();
                    obj = obj.parent;
                }
            }
        });
    },
    register: function(thing, cb) {
        zero.core.click.init();
        var thring = thing.bone || thing.thring;
        thring.__click = cb;
        thring.__name = thing.name;
        zero.core.click.targets.push(thring);
    }
};