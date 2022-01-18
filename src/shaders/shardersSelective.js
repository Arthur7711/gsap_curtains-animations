// for selectiveRenderTargets

export const vertexShader = `
  precision mediump float;

  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  uniform mat4 planeTextureMatrix;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    // varyings
    vVertexPosition = aVertexPosition;
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
  }
`;

export const fragmentShader = `
  precision mediump float;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D planeTexture;

  void main() {
    gl_FragColor = texture2D(planeTexture, vTextureCoord);
  }
`;

export const distortionFs = `
  precision mediump float;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D uRenderTexture;

  uniform float uScrollEffect;

  void main() {
    vec2 textureCoords = vTextureCoord;
    vec2 texCenter = vec2(0.5, 0.5);

    // distort around scene center
    textureCoords.y += cos((textureCoords.x - texCenter.x) * 3.141592) * uScrollEffect / 500.0;

    gl_FragColor = texture2D(uRenderTexture, textureCoords);
  }
`;

export const rgbFs = `
  precision mediump float;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D uRenderTexture;

  uniform float uScrollEffect;

  void main() {
    vec2 textureCoords = vTextureCoord;

    vec2 redTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 300.0);
    vec2 greenTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 600.0);
    vec2 blueTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 900.0);

    vec4 red = texture2D(uRenderTexture, redTextCoords);
    vec4 green = texture2D(uRenderTexture, greenTextCoords);
    vec4 blue = texture2D(uRenderTexture, blueTextCoords);

    vec4 finalColor = vec4(red.r, green.g, blue.b, min(1.0, red.a + blue.a + green.a));
    gl_FragColor = finalColor;
  }
`;

export const blurFs = `
  precision mediump float;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D uRenderTexture;

  uniform float uScrollEffect;
  uniform vec2 uResolution;

  // taken from https://github.com/Jam3/glsl-fast-gaussian-blur
  vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
      vec4 color = vec4(0.0);
      vec2 off1 = vec2(1.3333333333333333) * direction;
      color += texture2D(image, uv) * 0.29411764705882354;
      color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
      color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
      return color;
  }

  void main() {
    vec4 original = texture2D(uRenderTexture, vTextureCoord);
    vec4 blur = blur5(uRenderTexture, vTextureCoord, uResolution, vec2(0.0, 1.0));

    gl_FragColor = mix(original, blur, min(1.0, abs(uScrollEffect) / 5.0));
  }
`;
