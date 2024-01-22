/**
 * Create a cube and add it to the scene.
 */
import * as THREE from 'three';
import { dumpObject } from './dumpObject.js';

console.log("cubeModule.js");

export function addCube(scene) {
  let btnDraw = document.createElement("button");
  btnDraw.id = "addCube";
  btnDraw.innerHTML = "add cube";
  let canvas = document.querySelector('canvas');
  document.body.insertBefore(btnDraw, canvas);

  function cubeFun() {
    // Create a geometry and material for the cube
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    // Create a mesh
    const cube = new THREE.Mesh(geometry, material);
    cube.name = "Cube";

    // Set the position of the cube - adjust x, y, z as needed
    cube.position.set(0, 0, -5); // Moves the cube -5 on the z-axis, closer to the camera

    // Set the render order
    cube.renderOrder = 999;

    // Add the cube to the scene
    scene.add(cube);

    // console.log("scene.children:", scene.children);
    // console.log(`%c${dumpObject(scene).join('\n')}`, "color: #00ff00;");
  }

  btnDraw.addEventListener("click", cubeFun);
}
