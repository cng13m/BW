import { initLightRays } from "./LightRays.js";

const container = document.querySelector("#lightRays");

initLightRays(container, {
  raysOrigin: "top-center",
  raysColor: "#6f1428",
  raysSpeed: 0.45,
  lightSpread: 0.9,
  rayLength: 1.25,
  pulsating: true,
  fadeDistance: 0.95,
  saturation: 0.8,
  followMouse: true,
  mouseInfluence: 0.06,
  noiseAmount: 0.035,
  distortion: 0.025
});
