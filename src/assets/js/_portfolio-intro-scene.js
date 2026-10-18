import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

const INTRO_SPHERE_RADIUS = 1.64;
const INTRO_LIGHT_WAVE_DURATION = 3.4;
const INTRO_MUSIC_TEMPO = 108;
const INTRO_STAGE_SWEEP_DURATION = 7.2;
const INTRO_STAGE_SWEEP_ACTIVE_DURATION = INTRO_STAGE_SWEEP_DURATION * 0.84;
const INTRO_RIM_ROTATION_SPEED = 0.34;
const INTRO_RIM_START_ANGLE = Math.PI * 1.75;
const INTRO_EXIT_FLARE_DURATION = 0.95;
const INTRO_RIBBON_RADIUS = INTRO_SPHERE_RADIUS;
const INTRO_RIBBON_DURATION = 17;

const RIBBON_FLARE_FRAGMENT = `
  uniform float uStageAspect;
  uniform vec2 uRibbonFlarePosition;
  uniform float uRibbonFlareStrength;
  uniform float uRibbonFlareExpansion;
  varying vec2 vScreen;
  void main() {
    vec2 offset = (vScreen - uRibbonFlarePosition) * vec2(uStageAspect, 1.0);
    if (abs(offset.x) > 0.5 || abs(offset.y) > 0.4) discard;
    float radius = mix(0.045, 0.14, uRibbonFlareExpansion);
    float halo = exp(-dot(offset, offset) / (radius * radius)) * 0.38;
    float core = exp(-dot(offset, offset) / 0.0005);
    vec2 streak = offset / vec2(0.22, 0.007);
    float ray = exp(-dot(streak, streak)) * 0.5;
    gl_FragColor = vec4(mix(vec3(1.0, 0.72, 0.34), vec3(1.0, 0.98, 0.9), core), (core + halo + ray) * uRibbonFlareStrength);
  }
`;

const RIM_LIGHTING = `
  uniform float uRimAngle;
  float buildIntroRimArc(vec3 viewNormal) {
    vec2 direction = viewNormal.xy / max(length(viewNormal.xy), 0.0001);
    vec2 lightDirection = vec2(cos(uRimAngle), sin(uRimAngle));
    return pow(max(0.0, dot(direction, lightDirection)), 8.0);
  }
`;

const STAGE_LIGHTING = `
  uniform float uStageAspect;
  uniform float uStageSweepPhase;
  uniform float uStageSweepStrength;
  uniform float uStageSweepTime;
  uniform float uStageAfterglowStart;
  uniform vec3 uStageCyan;
  uniform vec3 uStageRose;
  uniform vec3 uStageAmber;
  vec3 buildIntroStageSweep(vec2 screen) {
    vec2 p = vec2(screen.x * uStageAspect, screen.y);
    // Clear both screen edges before resetting, including the soft halo.
    float extent = 0.73 * uStageAspect + 0.68 + 0.7;
    float center = mix(-extent, extent, uStageSweepPhase);
    float distanceToBand = p.x * 0.73 + p.y * 0.68 - center;
    float coreDistance = distanceToBand / 0.085;
    float haloDistance = distanceToBand / 0.22;
    // Keep the passed side softly lit through the pause and the next cycle's reset.
    float passageTime = (p.x * 0.73 + p.y * 0.68 + extent) / (2.0 * extent) * ${INTRO_STAGE_SWEEP_ACTIVE_DURATION};
    float age = mod(uStageSweepTime - passageTime + ${INTRO_STAGE_SWEEP_DURATION}, ${INTRO_STAGE_SWEEP_DURATION});
    float hasPassed = step(uStageAfterglowStart, uStageSweepTime - age);
    float afterglow = exp(-age / 1.25) * (1.0 - exp(-age / 0.1)) * hasPassed;
    return vec3(exp(-coreDistance * coreDistance) * uStageSweepStrength, exp(-haloDistance * haloDistance) * uStageSweepStrength, afterglow);
  }
  vec4 buildIntroStageLight(vec2 screen, float time) {
    vec2 p = vec2(screen.x * uStageAspect, screen.y);
    float cyanDistance = (p.x * 0.9 - p.y * 0.42 - sin(time * 0.23) * 0.85) / 0.72;
    vec2 amberPosition = vec2(cos(time * 0.16 + 0.4) * 0.85, -0.55 + sin(time * 0.21) * 0.25);
    vec2 amberDistance = (p - amberPosition) * vec2(1.3, 1.8);
    float cyan = exp(-cyanDistance * cyanDistance) * 0.5;
    vec3 sweep = buildIntroStageSweep(screen);
    float rose = sweep.y * 1.1 + sweep.z * 0.3;
    float amber = exp(-dot(amberDistance, amberDistance)) * 0.7;
    float strength = cyan + rose + amber;
    vec3 color = (uStageCyan * cyan + uStageRose * rose + uStageAmber * amber) / max(0.001, strength);
    return vec4(color, clamp(strength, 0.0, 1.0));
  }
`;

const STAGE_HAZE_VERTEX = `
  varying vec2 vScreen;
  void main() {
    vScreen = position.xy;
    gl_Position = vec4(position.xy, 0.99, 1.0);
  }
`;

const STAGE_HAZE_FRAGMENT = `
  uniform float uTime;
  uniform float uStageOpacity;
  varying vec2 vScreen;
  ${STAGE_LIGHTING}
  void main() {
    vec4 lighting = buildIntroStageLight(vScreen, uTime);
    float edge = 1.0 - smoothstep(0.5, 1.55, length(vScreen * vec2(0.75, 0.65)));
    gl_FragColor = vec4(lighting.rgb, lighting.a * uStageOpacity * edge);
  }
`;

const EXIT_FLARE_FRAGMENT = `
  uniform float uStageAspect;
  uniform vec2 uExitFlarePosition;
  uniform float uExitFlareStrength;
  uniform float uExitFlareExpansion;
  varying vec2 vScreen;
  void main() {
    vec2 flareOffset = (vScreen - uExitFlarePosition) * vec2(uStageAspect, 1.0);
    if (abs(flareOffset.x) > 0.7 || abs(flareOffset.y) > 0.7) discard;
    float coreRadius = mix(0.038, 0.024, uExitFlareExpansion);
    float haloRadius = mix(0.11, 0.22, uExitFlareExpansion);
    float core = exp(-dot(flareOffset, flareOffset) / (coreRadius * coreRadius)) * uExitFlareStrength;
    float halo = exp(-dot(flareOffset, flareOffset) / (haloRadius * haloRadius)) * uExitFlareStrength * 0.4;
    vec2 rayOffset = flareOffset / vec2(0.25, 0.014);
    float ray = exp(-dot(rayOffset, rayOffset)) * uExitFlareStrength * 0.42;
    float opacity = core + halo + ray;
    if (opacity < 0.001) discard;
    vec3 color = (vec3(1.0, 0.94, 1.0) * core + vec3(0.9, 0.55, 0.78) * halo + vec3(0.75, 0.88, 1.0) * ray) / max(opacity, 0.0001);
    gl_FragColor = vec4(color, min(opacity, 0.92));
  }
`;

const SPHERE_VERTEX = `
  uniform float uRibbonPhase;
  uniform float uRibbonPresence;
  uniform float uRibbonPointAngle;
  varying vec2 vRibbonLight;
  uniform float uTime;
  uniform float uInterior;
  uniform float uPixelRatio;
  uniform float uTrailPointLimit;
  uniform float uWavePhase;
  uniform float uWaveStrength;
  uniform float uKick;
  uniform float uSnarePhase;
  uniform float uSnareStrength;
  uniform float uHat;
  uniform float uHatStep;
  uniform float uMusicGain;
  uniform float uPulseScale;
  attribute float aSeed;
  attribute float aSize;
  varying float vEnergy;
  varying float vDepth;
  varying float vNearVisibility;
  varying float vViewDistance;
  varying float vLightWave;
  varying float vMusicLight;
  varying vec3 vStageColor;
  varying float vStageGlow;
  varying float vStageSweep;
  varying float vStageAfterglow;
  varying float vRimLight;
  ${STAGE_LIGHTING}
  ${RIM_LIGHTING}
  void main() {
    vec3 direction = normalize(position);
    float motionPresence = 1.0 - smoothstep(0.05, 0.85, uInterior);
    float lightPresence = mix(1.0, 0.3, uInterior);
    // Keep point positions stable; rhythm affects lighting instead of the shell.
    vec3 p = direction * ${INTRO_SPHERE_RADIUS} * uPulseScale;
    // Convert the rotating point shell into the ribbon's group-space orbit.
    vec3 ribbonDirection = direction;
    float ribbonCos = cos(uRibbonPointAngle);
    float ribbonSin = sin(uRibbonPointAngle);
    ribbonDirection.xy = mat2(ribbonCos, ribbonSin, -ribbonSin, ribbonCos) * ribbonDirection.xy;
    vec3 ribbonSide = vec3(0.0, 0.42, 0.9075241);
    vec3 ribbonNormal = vec3(0.0, -0.9075241, 0.42);
    float ribbonLatitude = dot(ribbonDirection, ribbonNormal);
    float ribbonAngle = atan(dot(ribbonDirection, ribbonSide), ribbonDirection.x) / 6.28318530718;
    float ribbonAge = mod(uRibbonPhase - ribbonAngle + 1.0, 1.0);
    float ribbonEnd = (1.0 - smoothstep(0.3, 0.48, ribbonAge)) * uRibbonPresence;
    float ribbonCore = exp(-pow(ribbonLatitude / 0.14, 2.0)) * exp(-ribbonAge / 0.1);
    float ribbonTrail = exp(-pow(ribbonLatitude / 0.21, 2.0)) * exp(-ribbonAge / 0.25) * 0.68;
    vRibbonLight = vec2(ribbonCore, ribbonTrail) * ribbonEnd;
    float orbitAngle = uWavePhase * 6.28318530718;
    vec3 orbitNormal = normalize(vec3(cos(orbitAngle), 0.42, sin(orbitAngle)));
    vec3 orbitSide = vec3(-sin(orbitAngle), 0.0, cos(orbitAngle));
    float orbitBand = exp(-pow(dot(direction, orbitNormal) / 0.16, 2.0));
    vLightWave = orbitBand * smoothstep(-0.15, 0.35, dot(direction, orbitSide)) * uWaveStrength;
    float latitude = dot(direction, normalize(vec3(0.24, 1.0, 0.18)));
    float snareCenter = mix(1.15, -1.15, uSnarePhase);
    float snareBand = exp(-pow((latitude - snareCenter) / 0.14, 2.0)) * uSnareStrength;
    float hatSelection = smoothstep(0.966, 0.985, fract(aSeed * 17.0 + uHatStep * 0.618034));
    vMusicLight = (snareBand * 0.7 + hatSelection * uHat * 0.32) * lightPresence;
    float band = sin(p.y * 11.0 + uTime * 1.7 + sin(p.x * 3.0) * 1.8);
    vEnergy = 0.62 + pow(max(0.0, band), 5.0) * 0.38;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vec3 viewNormal = normalize(normalMatrix * direction);
    vDepth = dot(viewNormal, normalize(-viewPosition.xyz));
    vRimLight = pow(1.0 - clamp(abs(vDepth), 0.0, 1.0), 2.2) * buildIntroRimArc(viewNormal);
    vNearVisibility = smoothstep(0.12, 0.45, -viewPosition.z);
    vViewDistance = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
    vec2 screen = gl_Position.xy / max(0.1, gl_Position.w);
    vec4 stageLight = buildIntroStageLight(screen, uTime);
    vStageColor = stageLight.rgb;
    vStageGlow = stageLight.a;
    vec3 stageSweep = buildIntroStageSweep(screen);
    vStageSweep = stageSweep.x;
    vStageAfterglow = stageSweep.z;
    float frontDepth = smoothstep(-0.45, 0.65, vDepth);
    float depthScale = mix(0.7, 1.24, frontDepth);
    float pointScale = mix(depthScale, 0.95, uInterior);
    float pointLimit = min(mix(92.0, 70.0, uInterior), uTrailPointLimit);
    gl_PointSize = clamp(aSize * uPixelRatio * (240.0 / max(0.12, -viewPosition.z)) * pointScale, min(2.0, pointLimit), pointLimit);
  }
`;

const SPHERE_FRAGMENT = `
  varying vec2 vRibbonLight;
  uniform float uOpacity;
  uniform float uInterior;
  uniform vec3 uBlue;
  varying float vEnergy;
  varying float vDepth;
  varying float vNearVisibility;
  varying float vViewDistance;
  varying float vLightWave;
  varying float vMusicLight;
  varying vec3 vStageColor;
  varying float vStageGlow;
  varying float vStageSweep;
  varying float vStageAfterglow;
  varying float vRimLight;
  void main() {
    // Keep the far hemisphere visible through the open point shell.
    float frontDepth = smoothstep(-0.45, 0.65, vDepth);
    float exterior = mix(0.6, 1.0, frontDepth);
    float interior = smoothstep(-0.035, 0.08, -vDepth);
    float facing = mix(exterior, interior, uInterior);
    if (facing < 0.001 || vNearVisibility < 0.001) discard;
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    if (radius > 1.0) discard;
    float core = exp(-radius * radius * 10.0);
    float halo = exp(-radius * radius * 4.0) * 0.2;
    float depth = abs(vDepth);
    float alpha = (core + halo) * vEnergy * mix(0.45, 1.1, depth) * uOpacity;
    float distanceLight = 1.0 - smoothstep(0.8, 2.8, vViewDistance) * 0.4;
    alpha *= facing * vNearVisibility * mix(1.0, 0.34 * distanceLight, uInterior);
    float accentLight = max(vLightWave, vMusicLight);
    alpha *= 1.0 + accentLight * 1.6;
    alpha *= 1.0 + vStageGlow * 0.35;
    float sweep = vStageSweep * mix(1.0, 0.45, uInterior);
    float afterglow = vStageAfterglow * mix(1.0, 0.45, uInterior);
    alpha *= (1.0 + sweep * 1.4) * (1.0 + afterglow * 0.22);
    vec3 stageBlue = mix(uBlue, vStageColor, vStageGlow * 0.82);
    vec3 color = mix(stageBlue, vec3(0.76, 0.9, 1.0), smoothstep(0.72, 1.0, vEnergy) * depth);
    color = mix(color, vec3(0.88, 0.96, 1.0), clamp(accentLight * 0.85, 0.0, 1.0));
    color = mix(color, vec3(0.9, 0.62, 0.78), afterglow * 0.32);
    color = mix(color, vec3(1.0, 0.88, 0.96), sweep * 0.97);
    float rimLight = vRimLight * (1.0 - smoothstep(0.05, 0.65, uInterior));
    color = mix(color, vec3(0.82, 0.95, 1.0), rimLight * 0.92);
    alpha *= 1.0 + rimLight;
    float farHemisphere = (1.0 - smoothstep(-0.25, 0.12, vDepth)) * (1.0 - uInterior);
    color = mix(color, vec3(0.32, 0.58, 1.0), farHemisphere * 0.7);
    vec3 ribbonColor = mix(vec3(1.0, 0.78, 0.42), vec3(1.0, 0.99, 0.93), clamp(vRibbonLight.x * 1.8, 0.0, 1.0));
    float ribbonColorStrength = clamp((vRibbonLight.x * 1.65 + vRibbonLight.y * 1.2) * mix(0.72, 1.0, frontDepth), 0.0, 0.98);
    color = mix(color, ribbonColor, ribbonColorStrength);
    alpha *= 1.0 + vRibbonLight.x * 4.0 + vRibbonLight.y * 1.2;
    gl_FragColor = vec4(color, alpha);
  }
`;

const INTERIOR_VERTEX = `
  uniform float uTime;
  uniform float uTravel;
  uniform float uAmbientTravel;
  uniform float uAmbientAngle;
  uniform float uInterior;
  uniform float uPixelRatio;
  uniform float uTrailStrength;
  uniform float uTrailDirection;
  uniform float uTrailPointLimit;
  uniform float uSnarePhase;
  uniform float uSnareStrength;
  uniform float uHat;
  uniform float uHatStep;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vNear;
  varying float vTrailStretch;
  varying float vTrailStrength;
  varying vec2 vTrailDirection;
  varying float vMusicLight;
  varying vec3 vStageColor;
  varying float vStageGlow;
  varying float vStageSweep;
  varying float vStageAfterglow;
  ${STAGE_LIGHTING}
  void main() {
    vec3 p = position;
    // A separate idle flow keeps moving when scroll input stops.
    float fieldDepth = 6.0 - mod(position.z + uTravel + uAmbientTravel, 6.0);
    p.z = -fieldDepth;
    float orbitCos = cos(uAmbientAngle);
    float orbitSin = sin(uAmbientAngle);
    p.xy = mat2(orbitCos, orbitSin, -orbitSin, orbitCos) * p.xy;
    p.x += sin(uTime * 0.4 + aSeed * 8.0) * 0.045;
    p.y += cos(uTime * 0.36 + aSeed * 12.0) * 0.04;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    float viewDepth = -viewPosition.z;
    float snareBand = exp(-pow((viewDepth / 6.0 - (1.0 - uSnarePhase)) / 0.1, 2.0)) * uSnareStrength;
    float hatSelection = smoothstep(0.966, 0.985, fract(aSeed * 17.0 + uHatStep * 0.618034));
    vMusicLight = snareBand * 0.18 + hatSelection * uHat * 0.12;
    gl_Position = projectionMatrix * viewPosition;
    vec2 screen = gl_Position.xy / max(0.1, gl_Position.w);
    vec4 stageLight = buildIntroStageLight(screen, uTime);
    vStageColor = stageLight.rgb;
    vStageGlow = stageLight.a;
    vec3 stageSweep = buildIntroStageSweep(screen);
    vStageSweep = stageSweep.x;
    vStageAfterglow = stageSweep.z;
    vec2 radial = vec2(viewPosition.x, -viewPosition.y);
    float radialLength = length(radial);
    vTrailDirection = radialLength > 0.0001 ? radial / radialLength * uTrailDirection : vec2(0.0, 1.0);
    vTrailStrength = uTrailStrength * smoothstep(0.03, 0.25, radialLength / max(0.18, viewDepth));
    float baseLimit = min(68.0, uTrailPointLimit);
    float baseSize = clamp(aSize * uPixelRatio * (180.0 / max(0.18, viewDepth)), min(2.0, baseLimit), baseLimit);
    float spriteSize = min(baseSize * (1.0 + vTrailStrength * 2.2), uTrailPointLimit);
    vTrailStretch = spriteSize / baseSize;
    gl_PointSize = spriteSize;
    vNear = 1.0 - smoothstep(0.65, 4.0, viewDepth);
    float nearVisibility = smoothstep(0.18, 0.65, viewDepth);
    float farVisibility = 1.0 - smoothstep(4.7, 6.0, viewDepth);
    vAlpha = (0.45 + aSeed * 0.18) * nearVisibility * farVisibility * smoothstep(0.15, 0.8, uInterior);
  }
`;

const INTERIOR_FRAGMENT = `
  uniform float uOpacity;
  uniform vec3 uBlue;
  varying float vAlpha;
  varying float vNear;
  varying float vTrailStretch;
  varying float vTrailStrength;
  varying vec2 vTrailDirection;
  varying float vMusicLight;
  varying vec3 vStageColor;
  varying float vStageGlow;
  varying float vStageSweep;
  varying float vStageAfterglow;
  void main() {
    vec2 point = (gl_PointCoord - 0.5) * 2.0;
    float along = dot(point, vTrailDirection);
    float across = dot(point, vec2(-vTrailDirection.y, vTrailDirection.x)) * vTrailStretch;
    float radius = length(vec2(along, across));
    if (radius > 1.0 || vAlpha < 0.001) discard;
    float light = exp(-radius * radius * 7.0) + exp(-radius * radius * 3.0) * 0.14;
    light *= mix(1.0, 0.72 + (along * 0.5 + 0.5) * 0.55, vTrailStrength);
    vec3 stageBlue = mix(uBlue, vStageColor, vStageGlow * 0.65);
    vec3 color = mix(stageBlue, vec3(0.8, 0.92, 1.0), clamp(vNear * 0.7 + vMusicLight, 0.0, 1.0));
    color = mix(color, vec3(0.9, 0.62, 0.78), vStageAfterglow * 0.14);
    color = mix(color, vec3(1.0, 0.88, 0.96), vStageSweep * 0.3);
    gl_FragColor = vec4(color, light * vAlpha * uOpacity * (1.0 + vMusicLight * 0.5) * (1.0 + vStageGlow * 0.25) * (1.0 + vStageSweep * 0.4) * (1.0 + vStageAfterglow * 0.1));
  }
`;

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = `
  uniform float uOpacity;
  uniform float uInterior;
  varying vec3 vNormal;
  varying vec3 vView;
  ${RIM_LIGHTING}
  void main() {
    vec3 viewNormal = normalize(vNormal);
    float edge = pow(1.0 - clamp(abs(dot(viewNormal, normalize(vView))), 0.0, 1.0), 3.0);
    float arc = buildIntroRimArc(viewNormal);
    float presence = 1.0 - smoothstep(0.05, 0.65, uInterior);
    float base = edge * 0.32 * (1.0 - uInterior);
    float halo = edge * arc * 0.22 * presence;
    float core = edge * edge * arc * 0.48 * presence;
    float opacity = base + halo + core;
    vec3 color = (vec3(0.08, 0.28, 0.8) * base + vec3(0.32, 0.7, 1.0) * halo + vec3(0.84, 0.96, 1.0) * core) / max(opacity, 0.0001);
    gl_FragColor = vec4(color, min(opacity * uOpacity, 0.95));
  }
`;

const DUST_VERTEX = `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.08 + aSeed * 12.0) * 0.07;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(uPixelRatio * (7.0 / max(0.12, -viewPosition.z)), 0.6, 2.0);
    vAlpha = (0.12 + aSeed * 0.18) * smoothstep(0.12, 0.45, -viewPosition.z);
  }
`;

const DUST_FRAGMENT = `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    if (radius > 1.0) discard;
    gl_FragColor = vec4(0.4, 0.64, 1.0, exp(-radius * radius * 5.0) * vAlpha * uOpacity);
  }
`;

function buildIntroSphereGeometry(count) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    const seed = ((index * 127.1) % 997) / 997;
    positions.set([Math.cos(angle) * radius * INTRO_SPHERE_RADIUS, y * INTRO_SPHERE_RADIUS, Math.sin(angle) * radius * INTRO_SPHERE_RADIUS], index * 3);
    seeds[index] = seed;
    sizes[index] = 0.8 + seed * 0.26;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  return geometry;
}

function buildIntroInteriorGeometry(count) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const seed = ((index * 73.37) % 233) / 233;
    const radius = Math.sqrt((index + 0.5) / count) * 2.7;
    const angle = goldenAngle * index;
    const depth = (((index * 97.13) % 307) / 307) * 6;
    positions.set([Math.cos(angle) * radius, Math.sin(angle) * radius, depth], index * 3);
    seeds[index] = seed;
    sizes[index] = 0.39375 + (((index * 41.19) % 163) / 163) * 0.225;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  return geometry;
}

function buildIntroDustGeometry() {
  const count = 450;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const seed = ((index * 127.1) % 997) / 997;
    positions.set([Math.sin(index * 12.989) * 9, Math.cos(index * 7.233) * 5, -4 + Math.sin(index * 3.71) * 4], index * 3);
    seeds[index] = seed;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geometry;
}

export function createPortfolioIntroScene(intro) {
  const canvas = intro.querySelector("canvas");
  const stage = intro.querySelector(".p-portfolio-intro__stage");
  const hero = intro.querySelector(".p-portfolio-hero");
  const journey = intro.querySelector(".p-portfolio-intro__journey");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  if (!canvas || forcedColors.matches) return () => {};

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "default" });
  } catch {
    intro.dataset.introRenderer = "fallback";
    return () => {};
  }

  // Establish the scroll range before the first layout measurement.
  intro.dataset.introRenderer = "three";
  renderer.setClearColor(0x030405, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 60);
  const group = new Group();
  const context = renderer.getContext();
  const hardwarePointLimit = Math.max(1, context.getParameter(context.ALIASED_POINT_SIZE_RANGE)[1]);
  const uniforms = {
    uTime: { value: 0 },
    uRibbonPhase: { value: 0.16 },
    uRibbonPresence: { value: 1 },
    uRibbonPointAngle: { value: 0 },
    uRibbonFlarePosition: { value: new Float32Array(2) },
    uRibbonFlareStrength: { value: 0 },
    uRibbonFlareExpansion: { value: 0 },
    uRimAngle: { value: INTRO_RIM_START_ANGLE },
    uExitFlarePosition: { value: new Float32Array(2) },
    uExitFlareStrength: { value: 0 },
    uExitFlareExpansion: { value: 0 },
    uStageAspect: { value: 1 },
    uStageSweepPhase: { value: 0 },
    uStageSweepStrength: { value: 0 },
    uStageSweepTime: { value: 1 },
    uStageAfterglowStart: { value: 1 },
    uStageOpacity: { value: 0.1 },
    uStageCyan: { value: new Color("#6bd2d1") },
    uStageRose: { value: new Color("#efb4de") },
    uStageAmber: { value: new Color("#f3c081") },
    uTravel: { value: 0 },
    uAmbientTravel: { value: 0 },
    uAmbientAngle: { value: 0 },
    uInterior: { value: 0 },
    uOpacity: { value: 1 },
    uPixelRatio: { value: 1 },
    uWavePhase: { value: 0 },
    uWaveStrength: { value: 0 },
    uKick: { value: 0 },
    uSnarePhase: { value: 0 },
    uSnareStrength: { value: 0 },
    uHat: { value: 0 },
    uHatStep: { value: 0 },
    uMusicGain: { value: 0 },
    uPulseScale: { value: 1 },
    uTrailStrength: { value: 0 },
    uTrailDirection: { value: 1 },
    uTrailPointLimit: { value: Math.min(112, hardwarePointLimit) },
    uBlue: { value: new Color("#75adff") },
  };
  // A single analytic backdrop adds soft stage haze without a postprocessing buffer.
  const hazeGeometry = new PlaneGeometry(2, 2);
  const hazeMaterial = new ShaderMaterial({ vertexShader: STAGE_HAZE_VERTEX, fragmentShader: STAGE_HAZE_FRAGMENT, uniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending });
  const haze = new Mesh(hazeGeometry, hazeMaterial);
  haze.frustumCulled = false;
  haze.renderOrder = -2;
  scene.add(haze);
  // An optical flare sits in front of the sphere; its draw is skipped between passes.
  const exitFlareMaterial = new ShaderMaterial({ vertexShader: STAGE_HAZE_VERTEX, fragmentShader: EXIT_FLARE_FRAGMENT, uniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending });
  const exitFlare = new Mesh(hazeGeometry, exitFlareMaterial);
  exitFlare.frustumCulled = false;
  exitFlare.renderOrder = 4;
  exitFlare.visible = false;
  scene.add(exitFlare);
  const sphereGeometry = buildIntroSphereGeometry(window.innerWidth < 768 ? 540 : 900);
  intro.dataset.introSpherePointCount = String(sphereGeometry.getAttribute("position").count);
  const sphereMaterial = new ShaderMaterial({ vertexShader: SPHERE_VERTEX, fragmentShader: SPHERE_FRAGMENT, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const sphere = new Points(sphereGeometry, sphereMaterial);
  sphere.renderOrder = 1;
  // Include rhythmic displacement in CPU-side culling bounds.
  sphereGeometry.computeBoundingSphere();
  sphereGeometry.boundingSphere.radius += 0.5;
  const compactGeometry = window.innerWidth < 768;
  const surfaceGeometry = new SphereGeometry(INTRO_SPHERE_RADIUS - 0.02, compactGeometry ? 48 : 96, compactGeometry ? 32 : 64);
  intro.dataset.introSurfaceTriangles = String(surfaceGeometry.index.count / 3);
  surfaceGeometry.computeBoundingSphere();
  surfaceGeometry.boundingSphere.radius += 0.5;
  const surfaceMaterial = new MeshPhysicalMaterial({ color: "#060b13", metalness: 0.3, roughness: 0.66, clearcoat: 0.18, clearcoatRoughness: 0.5, transparent: true, depthWrite: false });
  const surface = new Mesh(surfaceGeometry, surfaceMaterial);
  const atmosphereMaterial = new ShaderMaterial({ vertexShader: ATMOSPHERE_VERTEX, fragmentShader: ATMOSPHERE_FRAGMENT, uniforms, side: BackSide, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const atmosphere = new Mesh(surfaceGeometry, atmosphereMaterial);
  // Let the point shell define the silhouette without a continuous outer ring.
  atmosphere.visible = false;
  atmosphere.scale.setScalar(1.055);
  atmosphere.renderOrder = 2;
  group.add(surface, atmosphere);
  group.add(sphere);
  const ribbonFlareMaterial = new ShaderMaterial({ vertexShader: STAGE_HAZE_VERTEX, fragmentShader: RIBBON_FLARE_FRAGMENT, uniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending });
  const ribbonFlare = new Mesh(hazeGeometry, ribbonFlareMaterial);
  ribbonFlare.frustumCulled = false;
  ribbonFlare.renderOrder = 4;
  ribbonFlare.visible = false;
  scene.add(ribbonFlare);
  const ribbonHead = new Vector3();
  const ribbonCameraDirection = new Vector3();
  const ribbonNormal = new Vector3();
  let previousRibbonFacing = null;
  let ribbonFlareStartedAt = Number.NEGATIVE_INFINITY;
  let lastRibbonFlareAt = Number.NEGATIVE_INFINITY;
  intro.dataset.introRibbonMode = "points";
  // Keep forward travel separate from the rotating spherical backdrop.
  const interiorGeometry = buildIntroInteriorGeometry(window.innerWidth < 768 ? 120 : 220);
  const interiorMaterial = new ShaderMaterial({ vertexShader: INTERIOR_VERTEX, fragmentShader: INTERIOR_FRAGMENT, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const interiorPoints = new Points(interiorGeometry, interiorMaterial);
  interiorPoints.renderOrder = 2;
  // Wrapped shader positions extend beyond the geometry's original CPU bounds.
  interiorPoints.frustumCulled = false;
  interiorPoints.visible = false;
  scene.add(interiorPoints);
  scene.add(group);
  scene.add(new AmbientLight("#a0bfff", 0.25));
  const keyLight = new DirectionalLight("#dceaff", 0.8);
  keyLight.target = group;
  const rimLight = new DirectionalLight("#2669ff", 1.5);
  rimLight.target = group;
  scene.add(keyLight, rimLight);
  const dustGeometry = buildIntroDustGeometry();
  const dustMaterial = new ShaderMaterial({ vertexShader: DUST_VERTEX, fragmentShader: DUST_FRAGMENT, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
  scene.add(new Points(dustGeometry, dustMaterial));

  let destroyed = false;
  let visible = true;
  let contextLost = false;
  let frame = 0;
  let lastTime = 0;
  let qualityScale = 1;
  let qualitySampleDuration = 0;
  let qualitySampleFrames = 0;
  let qualityRenderDuration = 0;
  let elapsed = 0;
  let layoutDirty = true;
  let introTop = 0;
  let journeyDistance = 1;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let progress = 0;
  let sectionStarts = [];
  let activeSectionId = null;
  let waveStartedAt = Number.NEGATIVE_INFINITY;
  let hasScrollSample = false;
  let previousScrollY = 0;
  let scrollVelocity = 0;
  let trailPeak = 0;
  let ambientTravel = 0;
  let ambientAngle = 0;
  let flareTopBoundary = 1;
  let previousFlareCycle = null;
  let previousFlareDistance = null;
  let lastFlareCycle = -1;
  let flareStartedAt = Number.NEGATIVE_INFINITY;
  const sections = [...intro.querySelectorAll(":scope > .p-portfolio-section[id]")];

  function updateIntroLayout() {
    const bounds = stage.getBoundingClientRect();
    viewportWidth = Math.max(1, bounds.width);
    viewportHeight = Math.max(1, bounds.height);
    const headerBottom = document.querySelector(".p-portfolio-header")?.getBoundingClientRect().bottom || 0;
    flareTopBoundary = MathUtils.clamp(1 - ((Math.max(0, headerBottom - bounds.top) + 16) / viewportHeight) * 2, -1, 1);
    const mobile = window.innerWidth < 768;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5, Math.sqrt((mobile ? 700000 : 1600000) / (viewportWidth * viewportHeight))) * qualityScale;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewportWidth, viewportHeight, false);
    uniforms.uPixelRatio.value = pixelRatio;
    intro.dataset.introPixelRatio = pixelRatio.toFixed(2);
    intro.dataset.introQualityScale = qualityScale.toFixed(2);
    uniforms.uTrailPointLimit.value = Math.min(window.innerWidth < 768 ? 96 : 112, hardwarePointLimit);
    camera.aspect = viewportWidth / viewportHeight;
    uniforms.uStageAspect.value = camera.aspect;
    camera.updateProjectionMatrix();
    introTop = intro.getBoundingClientRect().top + window.scrollY;
    journeyDistance = Math.max(viewportHeight, (journey?.offsetHeight || hero.offsetHeight * 3.2) - hero.offsetHeight);
    sectionStarts = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + window.scrollY }));
    hasScrollSample = false;
    previousFlareCycle = null;
    previousFlareDistance = null;
    layoutDirty = false;
  }

  function updateIntroScrollEffects(scrollY, deltaTime) {
    const probe = scrollY + viewportHeight * 0.6;
    let nextSectionId = "portfolio-hero";
    for (const section of sectionStarts) {
      if (section.top > probe) break;
      nextSectionId = section.id;
    }
    if (!hasScrollSample || reducedMotion.matches || deltaTime === 0) {
      scrollVelocity = 0;
      // Play once on a fresh top-of-page entry, while restored positions only establish a baseline.
      if (activeSectionId === null && scrollY <= introTop + 1 && !reducedMotion.matches) waveStartedAt = elapsed;
      activeSectionId = nextSectionId;
    } else {
      const targetVelocity = MathUtils.clamp((scrollY - previousScrollY) / viewportHeight / deltaTime, -8, 8);
      scrollVelocity = MathUtils.damp(scrollVelocity, targetVelocity, Math.abs(targetVelocity) > Math.abs(scrollVelocity) ? 14 : 9, deltaTime);
      if (Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;
      if (nextSectionId !== activeSectionId) {
        activeSectionId = nextSectionId;
        waveStartedAt = elapsed;
      }
    }
    previousScrollY = scrollY;
    hasScrollSample = true;
    if (reducedMotion.matches) waveStartedAt = Number.NEGATIVE_INFINITY;
    const wavePhase = MathUtils.clamp((elapsed - waveStartedAt) / INTRO_LIGHT_WAVE_DURATION, 0, 1);
    const waveStrength = reducedMotion.matches ? 0 : MathUtils.smoothstep(wavePhase, 0, 0.12) * (1 - MathUtils.smoothstep(wavePhase, 0.78, 1));
    const trailStrength = reducedMotion.matches ? 0 : MathUtils.smoothstep(Math.abs(scrollVelocity), 0.08, 3.4);
    uniforms.uWavePhase.value = wavePhase;
    uniforms.uWaveStrength.value = waveStrength;
    uniforms.uTrailStrength.value = trailStrength;
    if (Math.abs(scrollVelocity) > 0.02) uniforms.uTrailDirection.value = scrollVelocity < 0 ? -1 : 1;
    trailPeak = Math.max(trailPeak, trailStrength);
    intro.dataset.introWaveSection = activeSectionId;
    intro.dataset.introWavePhase = wavePhase.toFixed(3);
    intro.dataset.introWaveStrength = waveStrength.toFixed(3);
    intro.dataset.introScrollVelocity = scrollVelocity.toFixed(3);
    intro.dataset.introTrailStrength = trailStrength.toFixed(3);
    intro.dataset.introTrailPeak = trailPeak.toFixed(3);
  }

  function updateIntroMusicEffects() {
    // A silent 4/4 groove: kick on 1/3, snare on 2/4 and sparse eighth-note hats.
    const beat = (elapsed * INTRO_MUSIC_TEMPO) / 60;
    const gain = reducedMotion.matches ? 0 : MathUtils.smoothstep(elapsed, 0.3, 1.5);
    const kickPhase = beat % 2;
    const kick = gain * MathUtils.smoothstep(kickPhase, 0, 0.065) * Math.exp(-kickPhase * 5.5);
    const snarePhase = (beat + 1) % 2;
    const snare = gain * MathUtils.smoothstep(snarePhase, 0, 0.08) * (1 - MathUtils.smoothstep(snarePhase, 0.8, 1.15));
    const hatPhase = (beat * 2) % 1;
    const hat = gain * MathUtils.smoothstep(hatPhase, 0, 0.12) * Math.exp(-hatPhase * 6);
    uniforms.uKick.value = kick;
    uniforms.uSnarePhase.value = MathUtils.clamp(snarePhase / 1.15, 0, 1);
    uniforms.uSnareStrength.value = snare;
    uniforms.uHat.value = hat;
    uniforms.uHatStep.value = Math.floor(beat * 2) % 8;
    uniforms.uMusicGain.value = gain;
    intro.dataset.introMusic = reducedMotion.matches ? "reduced" : "rock";
    intro.dataset.introMusicTempo = String(INTRO_MUSIC_TEMPO);
    intro.dataset.introMusicKick = kick.toFixed(3);
    intro.dataset.introMusicSnare = snare.toFixed(3);
    intro.dataset.introMusicHat = hat.toFixed(3);
  }

  function updateIntroStageSweep() {
    // One directional pass, then an unlit pause while the beam returns offscreen.
    const sweepTime = reducedMotion.matches ? INTRO_STAGE_SWEEP_ACTIVE_DURATION * 0.5 : elapsed + 1;
    const cycleTime = sweepTime % INTRO_STAGE_SWEEP_DURATION;
    const phase = MathUtils.clamp(cycleTime / INTRO_STAGE_SWEEP_ACTIVE_DURATION, 0, 1);
    const strength = reducedMotion.matches ? 0.65 : MathUtils.smoothstep(phase, 0, 0.07) * (1 - MathUtils.smoothstep(phase, 0.93, 1));
    uniforms.uStageSweepPhase.value = phase;
    uniforms.uStageSweepStrength.value = strength;
    uniforms.uStageSweepTime.value = sweepTime;
    // Do not invent a pass before load; reduced motion shows a static trailing glow.
    uniforms.uStageAfterglowStart.value = reducedMotion.matches ? 0 : 1;
    intro.dataset.introStageSweepPhase = phase.toFixed(3);
    intro.dataset.introStageSweepStrength = strength.toFixed(3);
    intro.dataset.introStageSweepTime = cycleTime.toFixed(3);
  }

  function updateIntroRibbon(interior) {
    const presence = 1 - MathUtils.smoothstep(interior, 0.05, 0.7);
    const phase = reducedMotion.matches ? 0.16 : (0.16 + elapsed / INTRO_RIBBON_DURATION) % 1;
    uniforms.uRibbonPhase.value = phase;
    uniforms.uRibbonPresence.value = presence;
    uniforms.uRibbonPointAngle.value = sphere.rotation.z;
    intro.dataset.introRibbonPhase = phase.toFixed(3);
    intro.dataset.introRibbonPresence = presence.toFixed(3);
    if (reducedMotion.matches || presence < 0.01) {
      previousRibbonFacing = null;
      ribbonFlareStartedAt = Number.NEGATIVE_INFINITY;
      uniforms.uRibbonFlareStrength.value = 0;
      ribbonFlare.visible = false;
      intro.dataset.introRibbonFlare = "0.000";
      return;
    }
    const angle = phase * Math.PI * 2;
    ribbonHead.set(Math.cos(angle), Math.sin(angle) * 0.42, Math.sin(angle) * Math.sqrt(1 - 0.42 ** 2)).multiplyScalar(INTRO_RIBBON_RADIUS);
    group.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    ribbonHead.applyMatrix4(group.matrixWorld);
    ribbonNormal.copy(ribbonHead).sub(group.position).normalize();
    ribbonCameraDirection.copy(camera.position).sub(group.position);
    const distance = ribbonCameraDirection.length();
    const facing = ribbonNormal.dot(ribbonCameraDirection.normalize()) - INTRO_SPHERE_RADIUS / distance;
    if (previousRibbonFacing !== null && previousRibbonFacing > 0 && facing <= 0 && elapsed - lastRibbonFlareAt > 2) {
      ribbonFlareStartedAt = elapsed;
      lastRibbonFlareAt = elapsed;
      intro.dataset.introRibbonFlareAt = elapsed.toFixed(3);
      ribbonHead.project(camera);
      uniforms.uRibbonFlarePosition.value[0] = ribbonHead.x;
      uniforms.uRibbonFlarePosition.value[1] = ribbonHead.y;
    }
    previousRibbonFacing = facing;
    const age = elapsed - ribbonFlareStartedAt;
    const strength = MathUtils.smoothstep(age, 0, 0.12) * (1 - MathUtils.smoothstep(age, 0.22, 1.3)) * presence * 0.7;
    uniforms.uRibbonFlareStrength.value = strength;
    uniforms.uRibbonFlareExpansion.value = MathUtils.smoothstep(age, 0, 0.8);
    ribbonFlare.visible = strength > 0.001;
    intro.dataset.introRibbonFlare = strength.toFixed(3);
  }

  function updateIntroRimLight() {
    // Use the scene clock so hidden tabs pause and reduced motion stays static.
    const angle = (elapsed * INTRO_RIM_ROTATION_SPEED + INTRO_RIM_START_ANGLE) % (Math.PI * 2);
    uniforms.uRimAngle.value = angle;
    intro.dataset.introRimAngle = angle.toFixed(3);
  }

  function resetIntroExitFlare() {
    previousFlareCycle = null;
    previousFlareDistance = null;
    flareStartedAt = Number.NEGATIVE_INFINITY;
    uniforms.uExitFlareStrength.value = 0;
    uniforms.uExitFlareExpansion.value = 0;
    exitFlare.visible = false;
    intro.dataset.introExitFlare = "0.000";
    intro.dataset.introExitFlareExpansion = "0.000";
  }

  function updateIntroExitFlare(interior, pulseScale) {
    const depth = camera.position.z - group.position.z;
    const radius = INTRO_SPHERE_RADIUS * pulseScale;
    if (reducedMotion.matches || interior >= 0.65 || depth <= radius + 0.05) {
      resetIntroExitFlare();
      return;
    }

    // Exact perspective silhouette support along the stage band's direction.
    const centerX = group.position.x - camera.position.x;
    const centerY = group.position.y - camera.position.y;
    const focalLength = camera.projectionMatrix.elements[5];
    const denominator = depth * depth - radius * radius;
    const directionDot = 0.73 * centerX + 0.68 * centerY;
    const supportRoot = Math.sqrt(directionDot * directionDot + denominator * (0.73 * 0.73 + 0.68 * 0.68));
    let exitX = (focalLength * (depth * centerX + (radius * (directionDot * centerX + denominator * 0.73)) / supportRoot)) / denominator;
    let exitY = (focalLength * (depth * centerY + (radius * (directionDot * centerY + denominator * 0.68)) / supportRoot)) / denominator;

    // On portrait screens, use the last visible contour below the fixed header.
    if (exitY > flareTopBoundary) {
      const rayY = flareTopBoundary / focalLength;
      const distanceSquared = centerX * centerX + centerY * centerY + denominator;
      const quadraticA = centerY * centerY + denominator;
      const centerProjection = depth + centerY * rayY;
      const discriminant = centerProjection * centerProjection - quadraticA * (1 + rayY * rayY);
      const tolerance = 1e-8 * Math.max(1, centerProjection * centerProjection, quadraticA * (1 + rayY * rayY));
      if (discriminant < -tolerance) {
        resetIntroExitFlare();
        return;
      }
      exitX = (focalLength * (centerX * centerProjection + Math.sqrt(Math.max(0, distanceSquared * discriminant)))) / quadraticA;
      exitY = flareTopBoundary;
    }

    const positionX = exitX / camera.aspect;
    if (Math.abs(positionX) > 1 || exitY < -1) {
      resetIntroExitFlare();
      return;
    }
    const exitCoordinate = 0.73 * exitX + 0.68 * exitY;
    const extent = 0.73 * camera.aspect + 0.68 + 0.7;
    const sweepCenter = MathUtils.lerp(-extent, extent, uniforms.uStageSweepPhase.value);
    const distance = sweepCenter - exitCoordinate;
    const cycle = Math.floor(uniforms.uStageSweepTime.value / INTRO_STAGE_SWEEP_DURATION);
    if (previousFlareCycle === cycle && previousFlareDistance < 0 && distance >= 0 && lastFlareCycle !== cycle) {
      flareStartedAt = elapsed;
      lastFlareCycle = cycle;
    }
    previousFlareCycle = cycle;
    previousFlareDistance = distance;

    const age = elapsed - flareStartedAt;
    const expansion = MathUtils.smoothstep(age, 0, 0.58);
    const strength = MathUtils.smoothstep(age, 0, 0.1) * (1 - MathUtils.smoothstep(age, 0.18, INTRO_EXIT_FLARE_DURATION)) * (1 - MathUtils.smoothstep(interior, 0.05, 0.65)) * 0.82;
    // Follow the same contour while the sphere pulses, without firing a second time.
    uniforms.uExitFlarePosition.value[0] = positionX;
    uniforms.uExitFlarePosition.value[1] = exitY;
    uniforms.uExitFlareStrength.value = strength;
    uniforms.uExitFlareExpansion.value = expansion;
    exitFlare.visible = strength > 0.001;
    intro.dataset.introExitFlare = strength.toFixed(3);
    intro.dataset.introExitFlareExpansion = expansion.toFixed(3);
    intro.dataset.introExitFlareCycle = String(lastFlareCycle);
    intro.dataset.introExitFlarePosition = `${positionX.toFixed(3)},${exitY.toFixed(3)}`;
  }

  function updateIntroAmbientMotion(interior, deltaTime) {
    const presence = reducedMotion.matches ? 0 : MathUtils.smoothstep(interior, 0, 0.8);
    // Keep deliberate scroll direction dominant, including reverse scrolling.
    const idleWeight = 1 - MathUtils.smoothstep(Math.abs(scrollVelocity), 0.08, 1.2) * 0.85;
    const reverseSpeedLimit = scrollVelocity < -0.01 ? -scrollVelocity * 1.4 * 0.2 : Number.POSITIVE_INFINITY;
    const ambientSpeed = Math.min(0.48 * idleWeight, reverseSpeedLimit);
    const step = Math.min(0.05, deltaTime) * presence;
    ambientTravel = (ambientTravel + step * ambientSpeed) % 6;
    ambientAngle = (ambientAngle + step * 0.18) % (Math.PI * 2);
    uniforms.uAmbientTravel.value = ambientTravel;
    uniforms.uAmbientAngle.value = ambientAngle;
    intro.dataset.introAmbientTravel = ambientTravel.toFixed(3);
    intro.dataset.introAmbientAngle = ambientAngle.toFixed(3);
    intro.dataset.introAmbientSpeed = (ambientSpeed * presence).toFixed(3);
  }

  function renderIntroFrame(time = 0) {
    frame = 0;
    if (destroyed || contextLost || document.hidden || !visible) return;
    const mobile = window.innerWidth < 768;
    const interval = mobile ? 1000 / 30 : 1000 / 60;
    if (!reducedMotion.matches && lastTime && time - lastTime < interval - 1) {
      frame = requestAnimationFrame(renderIntroFrame);
      return;
    }
    if (layoutDirty) updateIntroLayout();
    const frameStarted = performance.now();
    const deltaTime = lastTime ? Math.min(0.1, Math.max(0, (time - lastTime) / 1000)) : 0;
    if (!reducedMotion.matches) elapsed += Math.min(0.05, deltaTime);
    lastTime = time;
    updateIntroScrollEffects(window.scrollY, deltaTime);
    updateIntroMusicEffects();
    updateIntroStageSweep();
    updateIntroRimLight();
    const scrollDistance = Math.max(0, window.scrollY - introTop);
    progress = Math.max(0, Math.min(1, scrollDistance / journeyDistance));
    const zoom = reducedMotion.matches ? 0 : progress;
    // Absolute scroll distance keeps travel reversible and stable on restored pages.
    const travel = reducedMotion.matches ? 0 : Math.max(0, (scrollDistance - journeyDistance * 0.6) / viewportHeight) * 1.4;
    uniforms.uTravel.value = travel;
    uniforms.uTime.value = elapsed;
    uniforms.uOpacity.value = 1;
    const portrait = !mobile && camera.aspect < 1.05;
    const initialDistance = mobile ? 9.0 : portrait ? 8.2 : 6.1;
    const remaining = 1 - zoom;
    const finalDistance = 0.24;
    // A continuous camera path crosses the shell and settles inside without reversing direction.
    camera.position.z = remaining ** 3 * initialDistance + 3 * remaining ** 2 * zoom * (initialDistance * 0.55) + 3 * remaining * zoom ** 2 * finalDistance + zoom ** 3 * finalDistance;
    const visibleHeight = 2 * Math.tan((42 * Math.PI) / 360) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const horizontalAnchor = mobile ? 0 : portrait ? 0.15 : 0.14;
    const alignment = 1 - MathUtils.smoothstep(zoom, 0.15, 0.7);
    group.position.set(visibleWidth * horizontalAnchor * alignment, (mobile ? visibleHeight * 0.19 : 0.05) * alignment, 0);
    const cameraDistance = camera.position.distanceTo(group.position);
    const interior = 1 - MathUtils.smoothstep(cameraDistance, INTRO_SPHERE_RADIUS - 0.34, INTRO_SPHERE_RADIUS + 0.41);
    uniforms.uInterior.value = interior;
    uniforms.uStageOpacity.value = MathUtils.lerp(0.1, 0.045, interior);
    intro.dataset.introStageLight = "cyan-rose-amber";
    intro.dataset.introStageOpacity = uniforms.uStageOpacity.value.toFixed(3);
    updateIntroAmbientMotion(interior, deltaTime);
    const pulseScale = 1;
    uniforms.uPulseScale.value = pulseScale;
    intro.dataset.introPulseScale = pulseScale.toFixed(3);
    surface.scale.setScalar(pulseScale);
    atmosphere.scale.setScalar(1.055 * pulseScale);
    interiorPoints.visible = interior > 0.001;
    surfaceMaterial.opacity = (1 - MathUtils.smoothstep(interior, 0, 0.65)) * 0.07;
    surface.visible = surfaceMaterial.opacity > 0.001;
    const fieldOfView = 42 + interior * 26;
    if (Math.abs(camera.fov - fieldOfView) > 0.001) {
      camera.fov = fieldOfView;
      camera.updateProjectionMatrix();
    }
    updateIntroExitFlare(interior, pulseScale);
    group.rotation.set(0.16, elapsed * 0.18, -0.22);
    sphere.rotation.z = elapsed * 0.045;
    atmosphere.rotation.copy(sphere.rotation);
    updateIntroRibbon(interior);
    interiorPoints.position.copy(camera.position);
    keyLight.position.set(group.position.x - 3.5, group.position.y + 4, 5);
    rimLight.position.set(group.position.x + 3, group.position.y + 0.5, -2);
    renderer.render(scene, camera);
    // Measure actual scene work, not rAF gaps caused by an occluded browser window.
    if (!reducedMotion.matches && deltaTime > 0) {
      qualitySampleDuration += deltaTime * 1000;
      qualityRenderDuration += performance.now() - frameStarted;
      qualitySampleFrames += 1;
      if (qualitySampleDuration >= 1000 && qualitySampleFrames >= 6) {
        const frameCost = qualityRenderDuration / qualitySampleFrames;
        intro.dataset.introFrameCostMs = frameCost.toFixed(1);
        if (frameCost > interval * 0.75 && qualityScale > 0.6) {
          qualityScale = Math.max(0.6, qualityScale * 0.82);
          layoutDirty = true;
        }
        qualitySampleDuration = 0;
        qualitySampleFrames = 0;
        qualityRenderDuration = 0;
      }
    }
    intro.dataset.introRenderer = "three";
    intro.dataset.introPlayback = reducedMotion.matches ? "reduced" : "playing";
    intro.dataset.introProgress = progress.toFixed(2);
    intro.dataset.introTravel = travel.toFixed(3);
    intro.dataset.introCameraDistance = cameraDistance.toFixed(2);
    intro.dataset.introPhase = cameraDistance > INTRO_SPHERE_RADIUS + 0.16 ? "approach" : cameraDistance < INTRO_SPHERE_RADIUS - 0.16 ? "inside" : "surface";
    if (!reducedMotion.matches) frame = requestAnimationFrame(renderIntroFrame);
  }

  function queueIntroFrame() {
    if (!destroyed && !frame && visible && !document.hidden && !contextLost) frame = requestAnimationFrame(renderIntroFrame);
  }

  function handleIntroResize() {
    layoutDirty = true;
    queueIntroFrame();
  }

  function syncIntroPlayback() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    qualitySampleDuration = 0;
    qualitySampleFrames = 0;
    qualityRenderDuration = 0;
    hasScrollSample = false;
    scrollVelocity = 0;
    resetIntroExitFlare();
    canvas.hidden = forcedColors.matches;
    if (forcedColors.matches) return;
    queueIntroFrame();
  }

  function handleIntroContextLost(event) {
    event.preventDefault();
    contextLost = true;
    intro.dataset.introRenderer = "fallback";
    syncIntroPlayback();
  }

  function handleIntroContextRestored() {
    contextLost = false;
    intro.dataset.introRenderer = "three";
    layoutDirty = true;
    syncIntroPlayback();
  }

  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) intro.dataset.introPlayback = "offscreen";
    syncIntroPlayback();
  });
  intersectionObserver.observe(intro);
  const resizeObserver = new ResizeObserver(handleIntroResize);
  resizeObserver.observe(stage);
  resizeObserver.observe(intro);
  resizeObserver.observe(hero);
  if (journey) resizeObserver.observe(journey);
  window.addEventListener("scroll", queueIntroFrame, { passive: true });
  window.addEventListener("resize", handleIntroResize, { passive: true });
  document.addEventListener("visibilitychange", syncIntroPlayback);
  reducedMotion.addEventListener("change", syncIntroPlayback);
  forcedColors.addEventListener("change", syncIntroPlayback);
  canvas.addEventListener("webglcontextlost", handleIntroContextLost);
  canvas.addEventListener("webglcontextrestored", handleIntroContextRestored);
  syncIntroPlayback();

  return () => {
    destroyed = true;
    if (frame) cancelAnimationFrame(frame);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("scroll", queueIntroFrame);
    window.removeEventListener("resize", handleIntroResize);
    document.removeEventListener("visibilitychange", syncIntroPlayback);
    reducedMotion.removeEventListener("change", syncIntroPlayback);
    forcedColors.removeEventListener("change", syncIntroPlayback);
    canvas.removeEventListener("webglcontextlost", handleIntroContextLost);
    canvas.removeEventListener("webglcontextrestored", handleIntroContextRestored);
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    ribbonFlareMaterial.dispose();
    interiorGeometry.dispose();
    interiorMaterial.dispose();
    surfaceGeometry.dispose();
    surfaceMaterial.dispose();
    atmosphereMaterial.dispose();
    dustGeometry.dispose();
    dustMaterial.dispose();
    hazeGeometry.dispose();
    hazeMaterial.dispose();
    exitFlareMaterial.dispose();
    renderer.dispose();
  };
}
