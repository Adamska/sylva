uniform vec3 uBackDirection;
uniform vec3 uDustColor;
uniform vec3 uSporeColor;
uniform float uGlow;
uniform float uHaze;

varying vec3 vWorldPosition;
varying float vTwinkle;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  float disc = smoothstep(0.5, 0.05, length(offset));
  vec3 viewRay = normalize(vWorldPosition - cameraPosition);
  float forward = pow(max(dot(viewRay, uBackDirection), 0.0), 5.0);

  vec3 color = uDustColor * (0.008 + 0.55 * forward) + uSporeColor * uGlow * 0.8;
  gl_FragColor = vec4(color * disc * vTwinkle * uHaze, 1.0);
}
