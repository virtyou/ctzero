varying vec2 vUv;
// MORPH IMPORTS HERE

void main (void) {
	vUv = uv;

	// TODO: this bs is wrong and hacky -- save me chris!
	vec4 pos = vec4( position.x, position.y + 20.0, position.z, 1.0 );

// MORPH LOGIC HERE

	gl_Position = projectionMatrix * modelViewMatrix * pos;
}