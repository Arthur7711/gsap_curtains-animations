// for selectiveRenderTargets

// export const vertexShader = `
//   precision mediump float;

//   attribute vec3 aVertexPosition;
//   attribute vec2 aTextureCoord;

//   uniform mat4 uMVMatrix;
//   uniform mat4 uPMatrix;

//   uniform mat4 planeTextureMatrix;

//   varying vec3 vVertexPosition;
//   varying vec2 vTextureCoord;

//   void main() {
//     gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

//     // varyings
//     vVertexPosition = aVertexPosition;
//     vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
//   }
// `;

// export const fragmentShader = `
//   precision mediump float;

//   varying vec3 vVertexPosition;
//   varying vec2 vTextureCoord;

//   uniform sampler2D planeTexture;

//   void main() {
//     gl_FragColor = texture2D(planeTexture, vTextureCoord);
//   }
// `;

// export const distortionFs = `
//   precision mediump float;

//   varying vec3 vVertexPosition;
//   varying vec2 vTextureCoord;

//   uniform sampler2D uRenderTexture;

//   uniform float uScrollEffect;

//   void main() {
//     vec2 textureCoords = vTextureCoord;
//     vec2 texCenter = vec2(0.5, 0.5);

//     // distort around scene center
//     textureCoords.y += cos((textureCoords.x - texCenter.x) * 3.141592) * uScrollEffect / 500.0;

//     gl_FragColor = texture2D(uRenderTexture, textureCoords);
//   }
// `;

// export const rgbFs = `
//   precision mediump float;

//   varying vec3 vVertexPosition;
//   varying vec2 vTextureCoord;

//   uniform sampler2D uRenderTexture;

//   uniform float uScrollEffect;

//   void main() {
//     vec2 textureCoords = vTextureCoord;

//     vec2 redTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 300.0);
//     vec2 greenTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 600.0);
//     vec2 blueTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 900.0);

//     vec4 red = texture2D(uRenderTexture, redTextCoords);
//     vec4 green = texture2D(uRenderTexture, greenTextCoords);
//     vec4 blue = texture2D(uRenderTexture, blueTextCoords);

//     vec4 finalColor = vec4(red.r, green.g, blue.b, min(1.0, red.a + blue.a + green.a));
//     gl_FragColor = finalColor;
//   }
// `;

// export const blurFs = `
//   precision mediump float;

//   varying vec3 vVertexPosition;
//   varying vec2 vTextureCoord;

//   uniform sampler2D uRenderTexture;

//   uniform float uScrollEffect;
//   uniform vec2 uResolution;

//   // taken from https://github.com/Jam3/glsl-fast-gaussian-blur
//   vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
//       vec4 color = vec4(0.0);
//       vec2 off1 = vec2(1.3333333333333333) * direction;
//       color += texture2D(image, uv) * 0.29411764705882354;
//       color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
//       color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
//       return color;
//   }

//   void main() {
//     vec4 original = texture2D(uRenderTexture, vTextureCoord);
//     vec4 blur = blur5(uRenderTexture, vTextureCoord, uResolution, vec2(0.0, 1.0));

//     gl_FragColor = mix(original, blur, min(1.0, abs(uScrollEffect) / 5.0));
//   }
// `;

// for sliderShow
export const vertexShader = `
  precision mediump float;
  // default mandatory variables
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  // varyings : notice we've got 3 texture coords varyings
  // one for the displacement texture
  // one for our visible texture
  // and one for the upcoming texture
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  varying vec2 vActiveTextureCoord;
  varying vec2 vNextTextureCoord;
  // textures matrices
  uniform mat4 activeTexMatrix;
  uniform mat4 nextTexMatrix;
  // custom uniforms
  uniform float uTransitionTimer;
  void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    // varyings
    vTextureCoord = aTextureCoord;
    vActiveTextureCoord = (activeTexMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vNextTextureCoord = (nextTexMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = aVertexPosition;
  }
`;

export const fragmentShader = `
  precision mediump float;
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  varying vec2 vActiveTextureCoord;
  varying vec2 vNextTextureCoord;
  // custom uniforms
  uniform float uTransitionTimer;
  // our textures samplers
  // notice how it matches the sampler attributes of the textures we created dynamically
  uniform sampler2D activeTex;
  uniform sampler2D nextTex;
  uniform sampler2D displacement;
  void main() {
    // our displacement texture
    vec4 displacementTexture = texture2D(displacement, vTextureCoord);
    // slides transitions based on displacement and transition timer
    vec2 firstDisplacementCoords = vActiveTextureCoord + displacementTexture.r * ((cos((uTransitionTimer + 90.0) / (90.0 / 3.141592)) + 1.0) / 1.25);
    vec4 firstDistortedColor = texture2D(activeTex, vec2(vActiveTextureCoord.x, firstDisplacementCoords.y));
    // same as above but we substract the effect
    vec2 secondDisplacementCoords = vNextTextureCoord - displacementTexture.r * ((cos(uTransitionTimer / (90.0 / 3.141592)) + 1.0) / 1.25);
    vec4 secondDistortedColor = texture2D(nextTex, vec2(vNextTextureCoord.x, secondDisplacementCoords.y));
    // mix both texture
    vec4 finalColor = mix(firstDistortedColor, secondDistortedColor, 1.0 - ((cos(uTransitionTimer / (90.0 / 3.141592)) + 1.0) / 2.0));
    // handling premultiplied alpha
    finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);
    gl_FragColor = finalColor;
  }
`;
