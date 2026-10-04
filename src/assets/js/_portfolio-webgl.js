const LIGHT_SPRITE_URL = new URL("../images/light_strobe.webp", import.meta.url).href;
const MAX_RENDER_PIXELS = 1800000;
const BLOOM_RESOLUTION = 0.25;
const FOREGROUND_LIGHTS = [
  [0.035, 0.16, 0.85],
  [0.965, 0.27, 1],
  [0.045, 0.68, 1.1],
  [0.955, 0.73, 1.15],
  [0.2, 0.935, 1.1],
  [0.83, 0.94, 0.9],
  [0.48, 0.035, 0.75],
];

const LIGHT_VERTEX_SHADER = `
  attribute vec4 a_geometry;
  attribute float a_level;
  attribute float a_layer;
  uniform vec2 u_size;
  uniform vec2 u_wallRange;
  uniform float u_floorStart;
  uniform float u_perspectiveDepth;
  uniform float u_pixelRatio;
  uniform float u_pointLimit;
  uniform float u_bloom;
  varying float v_level;
  varying float v_layer;
  varying float v_reflectionStretch;
  void main() {
    vec2 normalized = a_geometry.xy / u_size;
    float perspective = 1.0 - (normalized.x - 0.5) * u_perspectiveDepth;
    vec2 position = u_size * vec2(0.5, 0.46);
    position += (a_geometry.xy - u_size * 0.5) * vec2(0.9, 0.76) * perspective;
    float pointScale = 0.82 * perspective;
    float mainLevel = a_level;
    float bloomLevel = a_level * smoothstep(0.2, 0.75, a_level);
    v_reflectionStretch = 1.0;
    if (a_layer > 0.5 && a_layer < 1.5) {
      float row = clamp((a_geometry.y - u_wallRange.x) / max(1.0, u_wallRange.y - u_wallRange.x), 0.0, 1.0);
      float distance = 1.0 - row;
      position.x = u_size.x * 0.5 + (position.x - u_size.x * 0.5) * (1.04 + distance * 0.18);
      position.y = u_size.y * (u_floorStart + distance * (0.97 - u_floorStart));
      pointScale = 1.25 * perspective * (1.0 + distance * 1.5);
      bloomLevel = a_level * (1.0 - distance * 0.6);
      mainLevel = bloomLevel * 0.2;
      v_reflectionStretch = 0.42 + distance * 0.42;
    } else if (a_layer > 1.5) {
      position = a_geometry.xy;
      pointScale = 1.0;
      mainLevel = 0.0;
      bloomLevel = a_level;
    }
    gl_Position = vec4(position.x / u_size.x * 2.0 - 1.0, 1.0 - position.y / u_size.y * 2.0, 0.0, 1.0);
    gl_PointSize = min(u_pointLimit, a_geometry.z * pointScale * (1.0 + a_level * 0.08) * u_pixelRatio);
    v_level = mix(mainLevel, bloomLevel, u_bloom);
    v_layer = a_layer;
  }
`;

const LIGHT_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_sprite;
  varying float v_level;
  varying float v_layer;
  varying float v_reflectionStretch;
  void main() {
    vec2 coordinate = gl_PointCoord;
    if (v_layer > 0.5 && v_layer < 1.5) coordinate.y = (coordinate.y - 0.5) / v_reflectionStretch + 0.5;
    if (coordinate.y < 0.0 || coordinate.y > 1.0) discard;
    vec4 sprite = texture2D(u_sprite, coordinate);
    float alpha = min(sprite.a * v_level, 1.0);
    gl_FragColor = vec4(sprite.rgb * alpha, alpha);
  }
`;

const FIXTURE_VERTEX_SHADER = `
  attribute vec4 a_fixture;
  attribute vec2 a_local;
  uniform vec2 u_size;
  varying vec2 v_local;
  varying float v_kind;
  void main() {
    gl_Position = vec4(a_fixture.x / u_size.x * 2.0 - 1.0, 1.0 - a_fixture.y / u_size.y * 2.0, 0.0, 1.0);
    v_local = a_local;
    v_kind = a_fixture.z;
  }
`;

const FIXTURE_FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_local;
  varying float v_kind;
  void main() {
    float rim = smoothstep(0.78, 1.0, max(abs(v_local.x), abs(v_local.y)));
    vec3 color = mix(vec3(0.025, 0.03, 0.035), vec3(0.09, 0.10, 0.11), rim);
    float alpha = 0.6;
    if (v_kind > 0.5) {
      color = vec3(0.065, 0.072, 0.08);
      alpha = 0.36;
    }
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const QUAD_VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const BLUR_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_step;
  varying vec2 v_uv;
  void main() {
    vec4 color = texture2D(u_texture, v_uv) * 0.227027;
    color += (texture2D(u_texture, v_uv + u_step) + texture2D(u_texture, v_uv - u_step)) * 0.194595;
    color += (texture2D(u_texture, v_uv + u_step * 2.0) + texture2D(u_texture, v_uv - u_step * 2.0)) * 0.121622;
    color += (texture2D(u_texture, v_uv + u_step * 3.0) + texture2D(u_texture, v_uv - u_step * 3.0)) * 0.054054;
    color += (texture2D(u_texture, v_uv + u_step * 4.0) + texture2D(u_texture, v_uv - u_step * 4.0)) * 0.016216;
    gl_FragColor = color;
  }
`;

const BLOOM_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_strength;
  varying vec2 v_uv;
  void main() {
    gl_FragColor = texture2D(u_texture, v_uv) * u_strength;
  }
`;

function createShader(gl, type, source, resources) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Light shader allocation failed");
  resources.shaders.push(shader);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Light shader compilation failed");
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource, attributes, uniforms, resources) {
  const program = gl.createProgram();
  if (!program) throw new Error("Light program allocation failed");
  resources.programs.push(program);
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, resources));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, resources));
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Light program linking failed");
  return { program, uniforms: Object.fromEntries(uniforms.map(name => [name, gl.getUniformLocation(program, name)])) };
}

function createTexture(gl, resources) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Light texture allocation failed");
  resources.textures.push(texture);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function createRenderTarget(gl, width, height, resources) {
  const texture = createTexture(gl, resources);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const framebuffer = gl.createFramebuffer();
  if (!framebuffer) throw new Error("Light framebuffer allocation failed");
  resources.framebuffers.push(framebuffer);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Light framebuffer is unavailable");
  return { texture, framebuffer, width, height };
}

function deleteRenderTargets(gl, resources) {
  resources.framebuffers.forEach(framebuffer => gl.deleteFramebuffer(framebuffer));
  resources.bloomTargets.forEach(target => gl.deleteTexture(target.texture));
  const bloomTextures = new Set(resources.bloomTargets.map(target => target.texture));
  resources.textures = resources.textures.filter(texture => !bloomTextures.has(texture));
  resources.framebuffers = [];
  resources.bloomTargets = [];
}

function deleteWebglResources(gl, resources) {
  if (!resources) return;
  resources.framebuffers.forEach(framebuffer => gl.deleteFramebuffer(framebuffer));
  resources.textures.forEach(texture => gl.deleteTexture(texture));
  resources.buffers.forEach(buffer => gl.deleteBuffer(buffer));
  resources.programs.forEach(program => gl.deleteProgram(program));
  resources.shaders.forEach(shader => gl.deleteShader(shader));
}

function createWebglResources(gl) {
  const resources = { shaders: [], programs: [], buffers: [], textures: [], framebuffers: [], bloomTargets: [] };
  try {
    resources.light = createProgram(
      gl,
      LIGHT_VERTEX_SHADER,
      LIGHT_FRAGMENT_SHADER,
      ["a_geometry", "a_level", "a_layer"],
      ["u_size", "u_wallRange", "u_floorStart", "u_perspectiveDepth", "u_pixelRatio", "u_pointLimit", "u_bloom", "u_sprite"],
      resources,
    );
    resources.fixture = createProgram(gl, FIXTURE_VERTEX_SHADER, FIXTURE_FRAGMENT_SHADER, ["a_fixture", "a_local"], ["u_size"], resources);
    resources.blur = createProgram(gl, QUAD_VERTEX_SHADER, BLUR_FRAGMENT_SHADER, ["a_position"], ["u_texture", "u_step"], resources);
    resources.bloom = createProgram(gl, QUAD_VERTEX_SHADER, BLOOM_FRAGMENT_SHADER, ["a_position"], ["u_texture", "u_strength"], resources);
    for (const name of ["geometryBuffer", "levelBuffer", "layerBuffer", "fixtureBuffer", "quadBuffer"]) {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Light buffer allocation failed");
      resources.buffers.push(buffer);
      resources[name] = buffer;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    resources.sprite = createTexture(gl, resources);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    resources.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    resources.maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    resources.pointLimit = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return resources;
  } catch (error) {
    deleteWebglResources(gl, resources);
    throw error;
  }
}

function buildLightWallPosition(light, width, height, perspectiveDepth) {
  const perspective = 1 - (light.x / width - 0.5) * perspectiveDepth;
  return { x: width * 0.5 + (light.x - width * 0.5) * 0.9 * perspective, y: height * 0.46 + (light.y - height * 0.5) * 0.76 * perspective };
}

function buildLightFixtureGeometry(lights, width, height, perspectiveDepth) {
  const vertices = [];
  const fixtures = lights.map(light => {
    const position = buildLightWallPosition(light, width, height, perspectiveDepth);
    const perspective = 1 - (light.x / width - 0.5) * perspectiveDepth;
    return { ...light, ...position, width: light.size * 0.82 * perspective * 0.38, height: light.size * 0.82 * perspective * 0.32 };
  });

  function addFixtureQuad(corners, kind) {
    const local = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];
    for (const index of [0, 1, 2, 2, 1, 3]) vertices.push(...corners[index], kind, 0, ...local[index]);
  }

  // Thin, dark supports sit behind the housings and follow the same plane.
  for (let row = 0; row < 7; row++) {
    const line = fixtures.filter(fixture => fixture.row === row).sort((left, right) => left.column - right.column);
    line.slice(1).forEach((right, index) => {
      const left = line[index];
      const start = [left.x, left.y + left.height * 0.2];
      const end = [right.x, right.y + right.height * 0.2];
      const length = Math.max(1, Math.hypot(end[0] - start[0], end[1] - start[1]));
      const offset = [(-(end[1] - start[1]) / length) * 0.4, ((end[0] - start[0]) / length) * 0.4];
      addFixtureQuad(
        [
          [start[0] - offset[0], start[1] - offset[1]],
          [end[0] - offset[0], end[1] - offset[1]],
          [start[0] + offset[0], start[1] + offset[1]],
          [end[0] + offset[0], end[1] + offset[1]],
        ],
        1,
      );
    });
  }
  fixtures.forEach(fixture => {
    const halfWidth = fixture.width * 0.5;
    const halfHeight = fixture.height * 0.5;
    addFixtureQuad(
      [
        [fixture.x - halfWidth, fixture.y - halfHeight],
        [fixture.x + halfWidth, fixture.y - halfHeight],
        [fixture.x - halfWidth, fixture.y + halfHeight],
        [fixture.x + halfWidth, fixture.y + halfHeight],
      ],
      0,
    );
  });
  return new Float32Array(vertices);
}

function addMediaListener(query, listener) {
  if (query.addEventListener) query.addEventListener("change", listener);
  else query.addListener(listener);
}

function removeMediaListener(query, listener) {
  if (query.removeEventListener) query.removeEventListener("change", listener);
  else query.removeListener(listener);
}

/** Read GSAP's DOM lights without taking ownership of their opacity or transforms. */
export function createWebglLightStage(stage) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  if (reducedMotion.matches || forcedColors.matches) return null;

  const canvas = document.createElement("canvas");
  canvas.className = "c-light-stage__canvas";
  canvas.setAttribute("aria-hidden", "true");
  let gl;
  try {
    gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
  } catch {
    return null;
  }
  if (!gl) return null;

  let resources;
  try {
    resources = createWebglResources(gl);
  } catch {
    return null;
  }

  const desktop = window.matchMedia("(min-width: 768px)");
  const sprite = new Image();
  let available = false;
  let destroyed = false;
  let contextLost = false;
  let pageSuspended = false;
  let failed = false;
  let spriteReady = false;
  let firstDraw = true;
  let geometryDirty = true;
  let frame = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let devicePixelRatio = window.devicePixelRatio || 1;
  let records = [];
  let drawRecords = [];
  let sourceLevels = new Float32Array(0);
  let levels = new Float32Array(0);
  let wallRange = [0, 1];
  let floorStart = 0.76;
  const perspectiveDepth = 0;
  let fixtureVertexCount = 0;
  stage.appendChild(canvas);

  function shouldRenderLightStage() {
    return available && !destroyed && !failed && !contextLost && !pageSuspended && spriteReady && !document.hidden && !reducedMotion.matches && !forcedColors.matches;
  }

  function stopLightFrames() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function syncLightRendering() {
    if (failed && !destroyed) {
      destroy();
      return;
    }
    if (!shouldRenderLightStage()) {
      stopLightFrames();
      if (reducedMotion.matches || forcedColors.matches || failed || contextLost) stage.classList.remove("is-webgl-light");
      return;
    }
    if (!frame) frame = window.requestAnimationFrame(drawLightFrame);
  }

  function setAvailable(value) {
    if (destroyed) return;
    available = Boolean(value);
    if (available) {
      geometryDirty = true;
    }
    syncLightRendering();
  }

  function stopLostLightContext() {
    contextLost = true;
    spriteReady = false;
    resources = null;
    stage.classList.remove("is-webgl-light");
    stopLightFrames();
  }

  function stopFailedLightRenderer() {
    // Loss may be observable before the browser dispatches webglcontextlost.
    if (gl.isContextLost()) stopLostLightContext();
    else {
      failed = true;
      syncLightRendering();
    }
  }

  function updateSpriteTexture() {
    gl.bindTexture(gl.TEXTURE_2D, resources.sprite);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite);
    spriteReady = true;
  }

  function handleSpriteLoad() {
    if (destroyed || contextLost) return;
    try {
      updateSpriteTexture();
      syncLightRendering();
    } catch {
      stopFailedLightRenderer();
    }
  }

  function handleSpriteError() {
    failed = true;
    syncLightRendering();
  }

  function updateLightGeometry() {
    const stageBounds = stage.getBoundingClientRect();
    width = Math.max(1, stage.clientWidth || stageBounds.width);
    height = Math.max(1, stage.clientHeight || stageBounds.height);
    devicePixelRatio = window.devicePixelRatio || 1;
    pixelRatio = Math.min(
      devicePixelRatio,
      desktop.matches ? 1.5 : 1,
      Math.sqrt(MAX_RENDER_PIXELS / (width * height)),
      resources.maxTextureSize / width,
      resources.maxTextureSize / height,
      resources.maxViewport[0] / width,
      resources.maxViewport[1] / height,
    );
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    const lights = [...stage.querySelectorAll(".c-light-stage__grid > .c-light")].filter(light => getComputedStyle(light).display !== "none");
    const columns = Math.max(0, ...lights.map(light => Number(light.dataset.lightColumn))) + 1;
    records = lights.map(light => {
      const bounds = light.getBoundingClientRect();
      const style = getComputedStyle(light);
      const row = Number(light.dataset.lightRow);
      const column = Number(light.dataset.lightColumn);
      return {
        light,
        row,
        column,
        x: bounds.left + bounds.width * 0.5 - stageBounds.left,
        y: bounds.top + bounds.height * 0.5 - stageBounds.top,
        size: parseFloat(style.width) || 40,
        base: parseFloat(style.opacity) || 0.22,
      };
    });
    wallRange = records.length ? [Math.min(...records.map(record => record.y)), Math.max(...records.map(record => record.y))] : [0, 1];
    const wallBottom = records.length ? Math.max(...records.map(record => buildLightWallPosition(record, width, height, perspectiveDepth).y + record.size * 0.5)) / height : 0.76;
    floorStart = Math.max(0.75, Math.min(0.8, wallBottom));
    drawRecords = records.map((record, sourceIndex) => ({ ...record, sourceIndex, layer: 0, gain: 1 }));
    // Bloom softens the mirrored floor; its source gain is reduced again during composition.
    drawRecords.push(...records.map((record, sourceIndex) => ({ ...record, sourceIndex, layer: 1, gain: 0.95 })));
    const peripheral = records.map((record, index) => ({ record, index })).filter(({ record }) => record.row === 0 || record.row === 6 || record.column === 0 || record.column === columns - 1);
    const foregroundSources = peripheral.length ? peripheral : records.map((record, index) => ({ record, index }));
    if (foregroundSources.length) {
      const foregroundSize = Math.max(72, Math.min(168, width * 0.1));
      FOREGROUND_LIGHTS.forEach(([x, y, scale], index) => {
        const source = foregroundSources[Math.floor((index * foregroundSources.length) / FOREGROUND_LIGHTS.length)];
        const size = foregroundSize * scale;
        drawRecords.push({ ...source.record, sourceIndex: source.index, x: x * width, y: y * height, size, layer: 2, gain: 0.7 });
      });
    }
    const geometry = new Float32Array(drawRecords.flatMap(record => [record.x, record.y, record.size, 0]));
    sourceLevels = new Float32Array(records.length);
    levels = new Float32Array(drawRecords.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.geometryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.layerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawRecords.map(record => record.layer)), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.levelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, levels, gl.DYNAMIC_DRAW);
    const fixtureGeometry = buildLightFixtureGeometry(records, width, height, perspectiveDepth);
    fixtureVertexCount = fixtureGeometry.length / 6;
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.fixtureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fixtureGeometry, gl.STATIC_DRAW);

    const bloomWidth = Math.max(1, Math.round(canvas.width * BLOOM_RESOLUTION));
    const bloomHeight = Math.max(1, Math.round(canvas.height * BLOOM_RESOLUTION));
    if (!resources.bloomTargets.length || resources.bloomTargets[0].width !== bloomWidth || resources.bloomTargets[0].height !== bloomHeight) {
      deleteRenderTargets(gl, resources);
      resources.bloomTargets.push(createRenderTarget(gl, bloomWidth, bloomHeight, resources));
      resources.bloomTargets.push(createRenderTarget(gl, bloomWidth, bloomHeight, resources));
      if (gl.getError() !== gl.NO_ERROR) throw new Error("Light framebuffer allocation failed");
    }
    geometryDirty = false;
  }

  function updateLightLevels() {
    records.forEach((record, index) => {
      const inlineOpacity = parseFloat(record.light.style.opacity);
      const source = Number.isFinite(inlineOpacity) ? inlineOpacity : record.base;
      const level = Math.max(0, Math.min(1.25, source));
      sourceLevels[index] = level;
    });
    drawRecords.forEach((record, index) => {
      levels[index] = sourceLevels[record.sourceIndex] * record.gain;
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.levelBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, levels);
  }

  function drawLightPoints(target, bloom) {
    const targetWidth = target ? target.width : canvas.width;
    const targetHeight = target ? target.height : canvas.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    gl.viewport(0, 0, targetWidth, targetHeight);
    if (target) gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const { program, uniforms } = resources.light;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.geometryBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.levelBuffer);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.layerBuffer);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.sprite);
    gl.uniform1i(uniforms.u_sprite, 0);
    gl.uniform2f(uniforms.u_size, width, height);
    gl.uniform2f(uniforms.u_wallRange, ...wallRange);
    gl.uniform1f(uniforms.u_floorStart, floorStart);
    gl.uniform1f(uniforms.u_perspectiveDepth, perspectiveDepth);
    gl.uniform1f(uniforms.u_pixelRatio, (pixelRatio * targetWidth) / canvas.width);
    gl.uniform1f(uniforms.u_pointLimit, resources.pointLimit);
    gl.uniform1f(uniforms.u_bloom, bloom ? 1 : 0);
    gl.drawArrays(gl.POINTS, 0, drawRecords.length);
  }

  function drawLightFixtures() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const { program, uniforms } = resources.fixture;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.fixtureBuffer);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 16);
    gl.uniform2f(uniforms.u_size, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, fixtureVertexCount);
  }

  function setQuadAttributes() {
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.quadBuffer);
    gl.enableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  function drawBlurPass(source, target, horizontal) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    gl.disable(gl.BLEND);
    const { program, uniforms } = resources.blur;
    gl.useProgram(program);
    setQuadAttributes();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(uniforms.u_texture, 0);
    gl.uniform2f(uniforms.u_step, horizontal ? 1.4 / source.width : 0, horizontal ? 0 : 1.4 / source.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function drawBloom() {
    const [source, blurred] = resources.bloomTargets;
    drawLightPoints(source, true);
    drawBlurPass(source, blurred, true);
    drawBlurPass(blurred, source, false);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const { program, uniforms } = resources.bloom;
    gl.useProgram(program);
    setQuadAttributes();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(uniforms.u_texture, 0);
    gl.uniform1f(uniforms.u_strength, desktop.matches ? 0.18 : 0.14);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function drawLightFrame() {
    frame = 0;
    if (!shouldRenderLightStage()) return;
    try {
      if (gl.isContextLost()) {
        stopLostLightContext();
        return;
      }
      if (devicePixelRatio !== (window.devicePixelRatio || 1)) geometryDirty = true;
      if (geometryDirty) updateLightGeometry();
      if (!records.length) return;
      updateLightLevels();
      gl.clearColor(0, 0, 0, 0);
      drawLightFixtures();
      drawLightPoints(null, false);
      drawBloom();
      if (firstDraw) {
        if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) throw new Error("Light drawing failed");
        firstDraw = false;
        stage.classList.add("is-webgl-light");
      } else if (!stage.classList.contains("is-webgl-light")) stage.classList.add("is-webgl-light");
    } catch {
      stopFailedLightRenderer();
      return;
    }
    syncLightRendering();
  }

  function handleResize() {
    geometryDirty = true;
    syncLightRendering();
  }

  function handleVisibilityChange() {
    syncLightRendering();
  }

  function handlePageHide() {
    pageSuspended = true;
    stopLightFrames();
  }

  function handlePageShow() {
    pageSuspended = false;
    geometryDirty = true;
    syncLightRendering();
  }

  function handleMotionChange() {
    syncLightRendering();
  }

  function handleContextLost(event) {
    event.preventDefault();
    stopLostLightContext();
  }

  function handleContextRestored() {
    if (destroyed) return;
    try {
      resources = createWebglResources(gl);
      contextLost = false;
      failed = false;
      firstDraw = true;
      geometryDirty = true;
      if (sprite.complete && sprite.naturalWidth) updateSpriteTexture();
      syncLightRendering();
    } catch {
      stopFailedLightRenderer();
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stopLightFrames();
    resizeObserver?.disconnect();
    removeMediaListener(desktop, handleResize);
    removeMediaListener(reducedMotion, handleMotionChange);
    removeMediaListener(forcedColors, handleMotionChange);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    sprite.onload = null;
    sprite.onerror = null;
    stage.classList.remove("is-webgl-light");
    canvas.remove();
    if (!contextLost) deleteWebglResources(gl, resources);
    resources = null;
    records = [];
    drawRecords = [];
  }

  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(handleResize);
  resizeObserver?.observe(stage);
  addMediaListener(desktop, handleResize);
  addMediaListener(reducedMotion, handleMotionChange);
  addMediaListener(forcedColors, handleMotionChange);
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  sprite.onload = handleSpriteLoad;
  sprite.onerror = handleSpriteError;
  sprite.crossOrigin = "anonymous";
  sprite.src = LIGHT_SPRITE_URL;
  return { setAvailable, destroy };
}
