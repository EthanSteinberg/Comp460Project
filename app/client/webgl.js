
function nextPowerOfTwo(number) {
  const power = Math.ceil(Math.log(number) / Math.log(2));
  return Math.pow(2, power);
}

function bindAttributes(context, program) {
  const positionLocation = context.getAttribLocation(program, 'position');
  const texLocation = context.getAttribLocation(program, 'a_texcoord');
  const texPos = context.getAttribLocation(program, 'a_texpos');
  const texSize = context.getAttribLocation(program, 'a_texsize');

  context.enableVertexAttribArray(positionLocation);
  context.vertexAttribPointer(positionLocation, 3, context.FLOAT, false, 4 * 9, 0);

  context.enableVertexAttribArray(texLocation);
  context.vertexAttribPointer(texLocation, 2, context.FLOAT, false, 4 * 9, 4 * 3);

  context.enableVertexAttribArray(texPos);
  context.vertexAttribPointer(texPos, 2, context.FLOAT, false, 4 * 9, 4 * 5);

  context.enableVertexAttribArray(texSize);
  context.vertexAttribPointer(texSize, 2, context.FLOAT, false, 4 * 9, 4 * 7);
}

function createAndCompileProgram(context, vertexSource, fragmentSource) {
  const program = context.createProgram();

  const vertex = context.createShader(context.VERTEX_SHADER);
  context.shaderSource(vertex, vertexSource);
  context.compileShader(vertex);
  context.attachShader(program, vertex);

  const fragment = context.createShader(context.FRAGMENT_SHADER);
  context.shaderSource(fragment, fragmentSource);
  context.compileShader(fragment);
  context.attachShader(program, fragment);

  context.linkProgram(program);
  context.validateProgram(program);

  const validateStatus = context.getProgramParameter(program, context.VALIDATE_STATUS);
  if (!validateStatus) {
    console.log('bad program');
    console.log('Info Log: ', context.getProgramInfoLog(program))
    console.log('fragmentSource: ', fragmentSource)
    console.log('vertex', context.getShaderInfoLog(vertex));
    console.log('fragment', context.getShaderInfoLog(fragment));
    return null;
  }

  return program;
}

export function createMainProgram(context, width, height, pixelJson) {
  const vertexSource = `
    attribute vec3 position;
    attribute vec2 a_texcoord;

    attribute vec2 a_texpos;
    attribute vec2 a_texsize;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    uniform vec2 screen_size;

    void main()
    {
      v_texcoord = a_texcoord;
      v_texpos = a_texpos;
      v_texsize = a_texsize;
      vec2 temp = vec2(2, -2) * position.xy / screen_size + vec2(-1, 1);
      gl_Position = vec4(temp, position.z, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform sampler2D testImage;

    uniform vec2 atlas_size;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    void main()
    {
      gl_FragColor = texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size);
    }
  `;

  const program = createAndCompileProgram(context, vertexSource, fragmentSource);

  context.useProgram(program);

  const screenSizeLocation = context.getUniformLocation(program, 'screen_size');
  context.uniform2f(screenSizeLocation, width, height);

  const atlasSizeLocation = context.getUniformLocation(program, 'atlas_size');
  context.uniform2f(atlasSizeLocation, pixelJson.sizex, pixelJson.sizey);

  const samplerLocation = context.getUniformLocation(program, 'testImage');
  context.uniform1i(samplerLocation, 0);

  return {
    setup() {
      context.disable(context.DEPTH_TEST);
      context.bindFramebuffer(context.FRAMEBUFFER, null);
      context.viewport(0, 0, width, height);
      context.useProgram(program);
      bindAttributes(context, program);
    },
  };
}

export function createMapProgram(context, width, height, pixelJson, mapWidth, mapHeight) {
  const vertexSource = `
    attribute vec3 position;
    attribute vec2 a_texcoord;

    attribute vec2 a_texpos;
    attribute vec2 a_texsize;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    varying vec2 v_pos;

    uniform vec2 screen_size;

    uniform float map_scale;

    uniform vec2 map_offset;

    void main()
    {
      v_texcoord = a_texcoord;
      v_texpos = a_texpos;
      v_texsize = a_texsize;
      v_pos = position.xy;
      vec2 temp = vec2(2, -2) * (map_offset + position.xy * map_scale) / screen_size + vec2(-1, 1);
      gl_Position = vec4(temp, position.z, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform sampler2D testImage;

    uniform sampler2D visibleMaskImage;
    uniform sampler2D exploredMaskImage;

    uniform vec2 atlas_size;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    varying vec2 v_pos;

    uniform vec2 map_texture_size;

    void main()
    {
      vec4 visible = texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size);
      vec4 background = vec4(0.0, 0.0, 0.0, 0.0);
      float visibleMask = texture2D(visibleMaskImage, v_pos / map_texture_size).r;
      float exploredMask = 1.0 - texture2D(exploredMaskImage, v_pos / map_texture_size).r;

      gl_FragColor = (visible * visibleMask);
    }
  `;

  const program = createAndCompileProgram(context, vertexSource, fragmentSource);

  context.useProgram(program);

  const screenSizeLocation = context.getUniformLocation(program, 'screen_size');
  context.uniform2f(screenSizeLocation, width, height);

  const atlasSizeLocation = context.getUniformLocation(program, 'atlas_size');
  context.uniform2f(atlasSizeLocation, pixelJson.sizex, pixelJson.sizey);

  const samplerLocation = context.getUniformLocation(program, 'testImage');
  context.uniform1i(samplerLocation, 0);

  const exploredMaskLocation = context.getUniformLocation(program, 'exploredMaskImage');
  context.uniform1i(exploredMaskLocation, 1);

  const visibleMaskImageLocation = context.getUniformLocation(program, 'visibleMaskImage');
  context.uniform1i(visibleMaskImageLocation, 2);

  const mapOffsetLocation = context.getUniformLocation(program, 'map_offset');

  const mapScaleLocation = context.getUniformLocation(program, 'map_scale');

  const mapTextureSizeLocation = context.getUniformLocation(program, 'map_texture_size');
  context.uniform2f(mapTextureSizeLocation, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight));

  return {
    setup(xPos, yPos, scale = 1.0) {
      context.disable(context.DEPTH_TEST);
      context.bindFramebuffer(context.FRAMEBUFFER, null);
      context.viewport(0, 0, width, height);
      context.useProgram(program);

      context.uniform2f(mapOffsetLocation, xPos, yPos);
      context.uniform1f(mapScaleLocation, scale);

      bindAttributes(context, program);
    },
  };
}

export function createFoggedMapProgram(context, width, height, pixelJson, mapWidth, mapHeight) {
  const vertexSource = `
    attribute vec3 position;
    attribute vec2 a_texcoord;

    attribute vec2 a_texpos;
    attribute vec2 a_texsize;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    varying vec2 v_pos;

    uniform vec2 screen_size;

    uniform vec2 map_offset;

    uniform float map_scale;

    void main()
    {
      v_texcoord = a_texcoord;
      v_texpos = a_texpos;
      v_texsize = a_texsize;
      v_pos = position.xy;
      vec2 temp = vec2(2, -2) * (map_offset + position.xy * map_scale) / screen_size + vec2(-1, 1);
      gl_Position = vec4(temp, position.z, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform sampler2D testImage;

    uniform sampler2D visibleMaskImage;
    uniform sampler2D exploredMaskImage;

    uniform vec2 atlas_size;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    varying vec2 v_pos;

    uniform vec2 map_texture_size;

    void main()
    {
      vec4 visible = texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size);
      vec4 background = vec4(0.5, 0.5, 0.5, 1.0) * visible.a;

      float visibleMask = texture2D(visibleMaskImage, v_pos / map_texture_size).x;
      float exploredMask = 1.0 - texture2D(exploredMaskImage, v_pos / map_texture_size).x;

      gl_FragColor = mix(background, visible, exploredMask);
    }
  `;

  const program = createAndCompileProgram(context, vertexSource, fragmentSource);

  context.useProgram(program);

  const screenSizeLocation = context.getUniformLocation(program, 'screen_size');
  context.uniform2f(screenSizeLocation, width, height);

  const atlasSizeLocation = context.getUniformLocation(program, 'atlas_size');
  context.uniform2f(atlasSizeLocation, pixelJson.sizex, pixelJson.sizey);

  const samplerLocation = context.getUniformLocation(program, 'testImage');
  context.uniform1i(samplerLocation, 0);

  const exploredMaskLocation = context.getUniformLocation(program, 'exploredMaskImage');
  context.uniform1i(exploredMaskLocation, 1);

  const visibleMaskImageLocation = context.getUniformLocation(program, 'visibleMaskImage');
  context.uniform1i(visibleMaskImageLocation, 2);

  const mapOffsetLocation = context.getUniformLocation(program, 'map_offset');
  const mapScaleLocation = context.getUniformLocation(program, 'map_scale');

  const mapTextureSizeLocation = context.getUniformLocation(program, 'map_texture_size');
  context.uniform2f(mapTextureSizeLocation, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight));

  return {
    setup(xPos, yPos, scale = 1.0) {
      context.disable(context.DEPTH_TEST);
      context.bindFramebuffer(context.FRAMEBUFFER, null);
      context.viewport(0, 0, width, height);
      context.useProgram(program);

      context.uniform2f(mapOffsetLocation, xPos, yPos);
      context.uniform1f(mapScaleLocation, scale);

      bindAttributes(context, program);
    },
  };
}

export function createVisibilityProgram(context, width, height, pixelJson, mapWidth, mapHeight) {
  const vertexSource = `
    attribute vec3 position;
    attribute vec2 a_texcoord;

    attribute vec2 a_texpos;
    attribute vec2 a_texsize;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    uniform vec2 map_texture_size;

    void main()
    {
      v_texcoord = a_texcoord;
      v_texpos = a_texpos;
      v_texsize = a_texsize;
      vec2 temp = vec2(2, 2) * position.xy / map_texture_size + vec2(-1, -1);
      gl_Position = vec4(temp, position.z, 1.0);
    }
  `;

  const fragmentSource = `
    #extension GL_EXT_frag_depth : enable
    precision mediump float;
    uniform sampler2D testImage;

    uniform vec2 atlas_size;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    void main()
    {
      gl_FragColor = texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size);
    }
  `;

  const program = createAndCompileProgram(context, vertexSource, fragmentSource);

  context.useProgram(program);

  const atlasSizeLocation = context.getUniformLocation(program, 'atlas_size');
  context.uniform2f(atlasSizeLocation, pixelJson.sizex, pixelJson.sizey);

  const samplerLocation = context.getUniformLocation(program, 'testImage');
  context.uniform1i(samplerLocation, 0);

  const mapTextureSizeLocation = context.getUniformLocation(program, 'map_texture_size');
  context.uniform2f(mapTextureSizeLocation, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight));

  const outputTextureTwo = context.createTexture();
  context.activeTexture(context.TEXTURE2);
  context.bindTexture(context.TEXTURE_2D, outputTextureTwo);
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight), 0, context.RGBA, context.UNSIGNED_BYTE, null);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);


  const frameBuffer = context.createFramebuffer();
  context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);

  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    outputTextureTwo,
    0,
  );

  return {
    context: context,
    setup() {
      context.disable(context.DEPTH_TEST);
      context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);
      context.viewport(0, 0, mapWidth, mapHeight);
      context.useProgram(program);

      bindAttributes(context, program);
    },
  };
}

export function createFogProgram(context, width, height, pixelJson, mapWidth, mapHeight) {
  const vertexSource = `
    attribute vec3 position;
    attribute vec2 a_texcoord;

    attribute vec2 a_texpos;
    attribute vec2 a_texsize;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    uniform vec2 map_texture_size;

    void main()
    {
      v_texcoord = a_texcoord;
      v_texpos = a_texpos;
      v_texsize = a_texsize;
      vec2 temp = vec2(2, 2) * position.xy / map_texture_size + vec2(-1, -1);
      gl_Position = vec4(temp, position.z, 1.0);
    }
  `;

  const fragmentSource = `
    #extension GL_EXT_frag_depth : enable
    precision mediump float;
    uniform sampler2D testImage;

    uniform vec2 atlas_size;

    varying vec2 v_texcoord;

    varying vec2 v_texpos;
    varying vec2 v_texsize;

    void main()
    {
      gl_FragDepthEXT = 1.0 - texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size).a;
    }
  `;

  const program = createAndCompileProgram(context, vertexSource, fragmentSource);

  context.useProgram(program);

  const atlasSizeLocation = context.getUniformLocation(program, 'atlas_size');
  context.uniform2f(atlasSizeLocation, pixelJson.sizex, pixelJson.sizey);

  const samplerLocation = context.getUniformLocation(program, 'testImage');
  context.uniform1i(samplerLocation, 0);

  const mapTextureSizeLocation = context.getUniformLocation(program, 'map_texture_size');
  context.uniform2f(mapTextureSizeLocation, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight));

  const outputTexture = context.createTexture();
  context.activeTexture(context.TEXTURE1);
  context.bindTexture(context.TEXTURE_2D, outputTexture);
  context.texImage2D(context.TEXTURE_2D, 0, context.DEPTH_COMPONENT, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight), 0, context.DEPTH_COMPONENT, context.UNSIGNED_SHORT, null);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);

  // Dummy color output because of Apple
  const outputTextureThree = context.createTexture();
  context.activeTexture(context.TEXTURE3);
  context.bindTexture(context.TEXTURE_2D, outputTextureThree);
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, nextPowerOfTwo(mapWidth), nextPowerOfTwo(mapHeight), 0, context.RGBA, context.UNSIGNED_BYTE, null);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);


  const frameBuffer = context.createFramebuffer();
  context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);

  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.DEPTH_ATTACHMENT,
    context.TEXTURE_2D,
    outputTexture,
    0,
  );

  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    outputTextureThree,
    0,
  );

  return {
    context: context,
    setup() {
      context.enable(context.DEPTH_TEST);
      context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);
      context.viewport(0, 0, mapWidth, mapHeight);
      context.useProgram(program);

      bindAttributes(context, program);
    },
  };
}

export function setupGL(context, pixelPng) {
  const texture = context.createTexture();
  context.activeTexture(context.TEXTURE0);
  context.bindTexture(context.TEXTURE_2D, texture);
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, pixelPng);

  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);

  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);

  context.enable(context.BLEND);
  context.blendEquation(context.FUNC_ADD);

  context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
}
