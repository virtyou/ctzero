varying vec2 vUv;
// MORPH IMPORTS HERE

void main (void) {
	vUv = uv;

	// TODO: this bs is wrong and hacky -- save me chris!
	vec3 pos = vec3(position.x, position.y + 20.0, position.z);

// MORPH LOGIC HERE

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}