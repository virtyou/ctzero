varying vec2 vUv;

void main (void)
{
	vUv = uv;
	// TODO: this crack is wrong and hacky -- save me chris!
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y + 20.0, position.z, 1.0 );
}