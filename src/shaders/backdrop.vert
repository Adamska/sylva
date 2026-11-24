varying vec2 vScreen;

void main() {
  vScreen = position.xy;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
