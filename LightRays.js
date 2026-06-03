import { Renderer, Program, Triangle, Mesh } from "https://cdn.jsdelivr.net/npm/ogl@0.0.80/dist/ogl.mjs";

const DEFAULT_COLOR = "#ffffff";

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
    : [1, 1, 1];
}

function getAnchorAndDir(origin, width, height) {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * height], dir: [0, 1] };
    case "top-right":
      return { anchor: [width, -outside * height], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * width, 0.5 * height], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * width, 0.5 * height], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * height], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * width, (1 + outside) * height], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [width, (1 + outside) * height], dir: [0, -1] };
    default:
      return { anchor: [0.5 * width, -outside * height], dir: [0, 1] };
  }
}

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShader = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 finalRayDir = rayDir;

  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

export function initLightRays(container, options = {}) {
  if (!container) return () => {};

  const settings = {
    raysOrigin: "top-center",
    raysColor: DEFAULT_COLOR,
    raysSpeed: 1,
    lightSpread: 1,
    rayLength: 2,
    pulsating: false,
    fadeDistance: 1,
    saturation: 1,
    followMouse: true,
    mouseInfluence: 0.1,
    noiseAmount: 0,
    distortion: 0,
    ...options
  };

  let renderer = null;
  let uniforms = null;
  let mesh = null;
  let animationId = null;
  let observer = null;
  let isRunning = false;
  const mouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };

  const updatePlacement = () => {
    if (!container || !renderer || !uniforms) return;
    const widthCss = Math.max(container.clientWidth, 1);
    const heightCss = Math.max(container.clientHeight, 1);

    renderer.dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(widthCss, heightCss);

    const width = widthCss * renderer.dpr;
    const height = heightCss * renderer.dpr;
    uniforms.iResolution.value = [width, height];

    const { anchor, dir } = getAnchorAndDir(settings.raysOrigin, width, height);
    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = dir;
  };

  const loop = time => {
    if (!isRunning || !renderer || !uniforms || !mesh) return;

    uniforms.iTime.value = time * 0.001;

    if (settings.followMouse && settings.mouseInfluence > 0) {
      const smoothing = 0.92;
      smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
      smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);
      uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
    }

    renderer.render({ scene: mesh });
    animationId = requestAnimationFrame(loop);
  };

  const handleMouseMove = event => {
    const rect = container.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width;
    mouse.y = (event.clientY - rect.top) / rect.height;
  };

  const start = () => {
    if (isRunning) return;
    isRunning = true;

    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true
    });

    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(gl.canvas);

    uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      rayDir: { value: [0, 1] },
      raysColor: { value: hexToRgb(settings.raysColor) },
      raysSpeed: { value: settings.raysSpeed },
      lightSpread: { value: settings.lightSpread },
      rayLength: { value: settings.rayLength },
      pulsating: { value: settings.pulsating ? 1 : 0 },
      fadeDistance: { value: settings.fadeDistance },
      saturation: { value: settings.saturation },
      mousePos: { value: [0.5, 0.5] },
      mouseInfluence: { value: settings.mouseInfluence },
      noiseAmount: { value: settings.noiseAmount },
      distortion: { value: settings.distortion }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms
    });
    mesh = new Mesh(gl, { geometry, program });

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    if (settings.followMouse) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    animationId = requestAnimationFrame(loop);
  };

  const stop = () => {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    window.removeEventListener("resize", updatePlacement);
    window.removeEventListener("mousemove", handleMouseMove);

    if (renderer) {
      const canvas = renderer.gl.canvas;
      const loseContext = renderer.gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();
      if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
    }

    renderer = null;
    uniforms = null;
    mesh = null;
  };

  observer = new IntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) {
      start();
    } else {
      stop();
    }
  }, { threshold: 0.1 });

  observer.observe(container);

  return () => {
    if (observer) observer.disconnect();
    stop();
  };
}
