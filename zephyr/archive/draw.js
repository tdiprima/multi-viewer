import * as THREE from 'three';
import { dumpObject } from './dumpObject.js';
console.log("draw.js");

export function draw(scene, renderer, controls) {
  console.log(`%c${dumpObject(scene).join('\n')}`, "color: #00ff00;");
  let isDrawing = false;
  let color = 0x000000;
  let size = 500;
  let smoothness = 32;

  // Set up event listeners
  renderer.domElement.addEventListener("mousedown", startDrawing);
  renderer.domElement.addEventListener("mousemove", drawing);
  renderer.domElement.addEventListener("mouseup", stopDrawing);
  renderer.domElement.addEventListener("mouseout", stopDrawing);

  // Geometry
  function sphere() {
    let geometry = new THREE.SphereGeometry(size, smoothness, smoothness);
    // Generate a random color
    // let randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    // let material = new THREE.MeshBasicMaterial({ color: randomColor });

    let material = new THREE.MeshBasicMaterial({ color });
    let sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    return sphere;
  }

  // Draw on canvas
  function drawing(event) {
    // console.log("drawing", isDrawing);
    if (!isDrawing) return;

    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    let x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    let y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    x *= 10000;
    y *= 10000;
    // console.log(x, y);

    // Create a new sphere
    let mesh = sphere();

    // For simplicity, this just sets it directly based on mouse coordinates
    mesh.position.set(x, y, 0);

  }

  // Start drawing
  function startDrawing(event) {
    // console.log("startDrawing");
    isDrawing = true;
    controls.enabled = false;
    drawing(event);
  }

  // Stop drawing
  function stopDrawing() {
    // console.log("stopDrawing");
    isDrawing = false;
    controls.enabled = true;
  }

}
