uniform sampler2D uSource;

varying vec2 vScreen;

vec3 fitRrtAndOdt(vec3 value) {
  vec3 numerator = value * (value + 0.0245786) - 0.000090537;
  vec3 denominator = value * (0.983729 * value + 0.4329510) + 0.238081;
  return numerator / denominator;
}

vec3 acesFilmic(vec3 color) {
  const mat3 inputMatrix = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outputMatrix = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  return clamp(outputMatrix * fitRrtAndOdt(inputMatrix * (color / 0.6)), 0.0, 1.0);
}

vec3 encodeSrgb(vec3 color) {
  return mix(pow(color, vec3(1.0 / 2.4)) * 1.055 - 0.055, color * 12.92, vec3(lessThanEqual(color, vec3(0.0031308))));
}

void main() {
  vec4 texel = texture2D(uSource, vScreen * 0.5 + 0.5);
  float coverage = clamp(texel.a, 0.0, 1.0);
  vec3 straight = coverage > 0.0 ? texel.rgb / coverage : vec3(0.0);
  gl_FragColor = vec4(encodeSrgb(acesFilmic(straight)), coverage);
}
