import "./style.css";
import { animate, inView } from "motion";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
const beanTag = document.querySelector("section.hero");

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

animate("section.content", {
  opacity: 0,
});

inView("section.content", (element) => {
  animate(
    element,
    {
      opacity: 1,
    },
    {
      duration: 1,
    },
  );
});

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Set background color to black with full transparency
beanTag.appendChild(renderer.domElement);

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function render(time) {
  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
