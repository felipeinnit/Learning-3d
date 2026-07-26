import "./style.css";

import { animate, inView } from "motion";
import {
  AmbientLight,
  Box3,
  Vector3,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { NoiseShader } from "./noise-shader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ------------------------
// DOM
// ------------------------

let currectEffect = 0;
let aimatedEffect = 0;

const heroSection = document.querySelector("section.hero");
const loaderTag = document.querySelector("div.loader-wrapper");

if (!heroSection) {
  throw new Error("section.hero not found");
}

inView("section.content", (element) => {
  animate(
    element.querySelectorAll("p, img"),
    { opacity: 1 },
    { duration: 1, delay: 1 },
  );
});

// ------------------------
// Scene
// ------------------------

const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.z = 25;

// ------------------------
// Renderer
// ------------------------

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

heroSection.appendChild(renderer.domElement);

// ------------------------
// Post Processing
// ------------------------

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const noisePass = new ShaderPass(NoiseShader);
noisePass.uniforms.effect.value = 1.0;
noisePass.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight;

composer.addPass(noisePass);

// ------------------------
// Lights
// ------------------------

camera.add(new AmbientLight(0x404040));

const keyLight = new DirectionalLight(0xffffff, 1);
keyLight.position.set(-1, 1, 3);
camera.add(keyLight);

const fillLight = new DirectionalLight(0xffffff, 0.5);
fillLight.position.set(1, 1, 3);
camera.add(fillLight);

const backLight = new DirectionalLight(0xffffff, 1);
backLight.position.set(-1, 3, -1);
camera.add(backLight);

scene.add(camera);

// ------------------------
// Groups
// ------------------------

const loadGroup = new Group();
loadGroup.position.set(0, -10, 0);

const scrollGroup = new Group();
scrollGroup.add(loadGroup);

scene.add(scrollGroup);

// ------------------------
// Model
// ------------------------
const loader = new GLTFLoader();

loader.load(
  "/models/model.glb",
  (gltf) => {
    const model = gltf.scene;

    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());

    model.position.sub(center);

    loadGroup.add(model);

    // start hidden position
    loadGroup.position.y = -27;

    animate(
      loadGroup.position,
      { y: 0 },
      {
        duration: 2,
        delay: 0.2,
        easing: "ease-out",
      },
    );

    animate(
      "header",
      {
        y: [-100, 0],
        opacity: [0, 1],
      },
      { duration: 1, delay: 2.5 },
    );

    animate(
      "section.new-drop",
      {
        y: [-100, 0],
        opacity: [0, 1],
      },
      { duration: 1, delay: 2 },
    );

    animate("section.content p, section.content img", { opacity: 0 });

    animate(".loader-wrapper", { y: -100 }, { duration: 1 });
  },
  (xhr) => {
    loaderTag.querySelector(".loader").innerHTML =
      `${Math.round((xhr.loaded / xhr.total) * 100)}%`;
  },
  (err) => {
    console.error("Load error:", err);
  },
);

// ------------------------
// Controls
// ------------------------

const controls = new OrbitControls(camera, renderer.domElement);

controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 2;

// ------------------------
// Resize
// ------------------------

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(window.devicePixelRatio);

  noisePass.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight;
});

// ------------------------
// Render Loop
// ------------------------

let timeoutEffect;

window.addEventListener("scroll", () => {
  clearTimeout(timeoutEffect);

  aimatedEffect = 1;

  timeoutEffect = setTimeout(() => {
    aimatedEffect = 0;
  }, 500);
});

function render() {
  controls.update();

  scrollGroup.rotation.y = window.scrollY * 0.001;

  currectEffect += (aimatedEffect - currectEffect) * 0.05;

  // send scroll effect to shader
  noisePass.uniforms.effect.value = currectEffect;

  if (noisePass.uniforms?.time) {
    noisePass.uniforms.time.value = performance.now() * 0.001;
  }

  composer.render();
}

renderer.setAnimationLoop(render);
