varying vec2 vUv;
// MORPH IMPORTS HERE

void main (void) {
	vUv = uv;
	vec3 pos = vec3(position.x, position.y, position.z);

// MORPH LOGIC HERE

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}