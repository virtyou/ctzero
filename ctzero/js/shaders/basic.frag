uniform sampler2D baseTexture;
varying vec2 vUv;

void main() {
	vec4 tex = texture2D(baseTexture, vUv);
	gl_FragColor = tex;
}