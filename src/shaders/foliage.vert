#include <common>
#include <shadowmap_pars_vertex>

attribute vec3 aAnchor;
attribute vec3 aAxis;
attribute float aSway;
attribute float aPhase;
attribute float aBranchFactor;
attribute float aShade;
attribute float aRule;
attribute float aOrgan;

uniform float uFlutter;
uniform float uSeason;
uniform float uOrganScale;
uniform float uTime;
uniform vec3 uKeyDirection;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vShade;
varying float vPhase;
varying float vRule;
varying float vOrgan;
varying float vTurn;

vec3 rotateAbout(vec3 vector, vec3 axis, float angle) {
  return mix(dot(axis, vector) * axis, vector, cos(angle)) + cross(axis, vector) * sin(angle);
}

void main() {
  float organ = min(aOrgan, 1.0);
  vec3 carried = windOffset(aAnchor, aBranchFactor);
  vec3 downwind = vec3(uWindDirection.x, 0.0, uWindDirection.y);
  float gust = windGust((modelMatrix * vec4(aAnchor, 1.0)).xyz);
  float force = min(1.2, uWindStrength * uFlutter) * mix(1.0, 0.75, organ) * aSway;
  float drive = min(0.95, force * (0.18 + 0.82 * gust));

  float beat = uWindTime * (8.0 + 6.0 * aPhase) + aPhase * 37.7;
  float lull = 0.5 + 0.5 * sin(uWindTime * (0.9 + 1.3 * aPhase) + aPhase * 91.0);
  float burst = 0.3 + 0.7 * lull * lull;
  float twist = (0.5 * sin(beat) + 0.3 * sin(beat * 1.618 + 1.3) + 0.2 * sin(beat * 2.71 + 4.1)) * drive * burst * 1.25;
  float swing = (0.7 * sin(beat * 0.53 + aPhase * 11.0) + 0.3 * sin(beat * 0.87 + 2.4)) * drive * (1.3 - burst) * 0.8;

  float rank = fract(aPhase * 7.31 + 0.137);
  float shed = smoothstep(0.62, 0.97, uSeason);
  float budding = mix(0.4, 1.0, smoothstep(0.0, 0.22, uSeason));
  float gone = step(rank, shed);
  float loose = step(shed, rank) * step(rank, shed + 0.12) * step(0.001, shed) * (1.0 - organ);
  float cycle = fract(uTime * 0.09 + aPhase * 17.0);
  float fall = smoothstep(0.35, 1.0, cycle) * loose;
  float presence = mix(1.0, smoothstep(0.0, 0.08, cycle) * (1.0 - smoothstep(0.92, 1.0, cycle)), loose);

  float unfurl = smoothstep(0.0, 0.25, uGrowth * 1.45 - 0.2 - aBranchFactor);
  float leafScale = unfurl * budding * (1.0 - gone) * presence;
  float scale = mix(leafScale, unfurl * uOrganScale, organ);

  vec3 tumbleAxis = normalize(vec3(sin(aPhase * 40.0), 0.35, cos(aPhase * 40.0)));
  vec3 hinge = normalize(cross(aAxis, tumbleAxis) + vec3(1e-5));
  vec3 torque = cross(aAxis, downwind);
  float lean = min(0.9, force * gust * 0.8) * length(torque);
  vec3 yieldAxis = normalize(torque + vec3(1e-5));

  vec3 blade = (position - aAnchor) * scale;
  blade = rotateAbout(rotateAbout(rotateAbout(blade, aAxis, twist), hinge, swing), yieldAxis, lean);
  blade = rotateAbout(blade, tumbleAxis, fall * 9.0);
  vec3 turned = rotateAbout(rotateAbout(rotateAbout(normal, aAxis, twist), hinge, swing), yieldAxis, lean);
  vec3 descent = vec3(
    sin(cycle * 9.0 + aPhase * 40.0) * 0.3 + uWindDirection.x * uWindStrength * 1.6,
    -(aAnchor.y + 0.5) * fall,
    cos(cycle * 7.0 + aPhase * 31.0) * 0.3 + uWindDirection.y * uWindStrength * 1.6
  ) * fall;

  vec3 swayed = aAnchor + blade + carried * (1.0 - fall) + descent;
  vec4 world = modelMatrix * vec4(swayed, 1.0);
  vec3 worldNormal = normalize(mat3(modelMatrix) * rotateAbout(turned, tumbleAxis, fall * 9.0));

  vWorldPosition = world.xyz;
  vWorldNormal = worldNormal;
  vUv = uv;
  vShade = aShade;
  vPhase = aPhase;
  vRule = aRule;
  vOrgan = aOrgan;
  vTurn = smoothstep(0.0, 1.0, smoothstep(0.48, 0.8, uSeason) * 1.5 - rank * 0.5) * (1.0 - organ);

  #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    vec3 towardLight = worldNormal * (dot(worldNormal, uKeyDirection) < 0.0 ? -1.0 : 1.0);
    vec4 shadowPoint = world + vec4(towardLight * directionalLightShadows[0].shadowNormalBias, 0.0);
    vDirectionalShadowCoord[0] = directionalShadowMatrix[0] * shadowPoint;
  #endif

  gl_Position = projectionMatrix * viewMatrix * world;
}
