import * as THREE from 'three';
import { createButton } from "../helpers/button.js"
import { getMousePosition } from "../helpers/mouse.js"

export function rectangle(scene, camera, renderer, controls) {
  let rectangleButton = createButton({
    id: "rectangle",
    innerHtml: "<i class=\"fa-regular fa-square\"></i>",
    title: "rectangle"
  });

  rectangleButton.addEventListener("click", function () {
    if (isDrawing) {
      isDrawing = false;
      controls.enabled = true;
    } else {
      isDrawing = true;
      controls.enabled = false;
    }
    console.log("rectangle isDrawing:", isDrawing);
  });

  const canvas = renderer.domElement;
  let material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  // Set up geometry
  let geometry = new THREE.BufferGeometry(); // our 3D object
  let vertices = new Float32Array(12); // 4 vertices
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3)); // each vertex is composed of 3 values

  // LineLoop: A continuous line that connects back to the start.
  let rect = new THREE.LineLoop(geometry, material);
  rect.renderOrder = 999;
  scene.add(rect);

  // Handle mouse events
  let isDrawing = false;
  let mouseIsPressed = false;
  let startPoint;
  let endPoint;
  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mousemove", onMouseMove, false);
  canvas.addEventListener("mouseup", onMouseUp, false);

  function onMouseDown(event) {
    if (isDrawing) {
      mouseIsPressed = true;
      startPoint = getMousePosition(event.clientX, event.clientY, canvas, camera);
    }
  }

  function onMouseMove(event) {
    if (isDrawing && mouseIsPressed) {
      endPoint = getMousePosition(event.clientX, event.clientY, canvas, camera);
      updateRectangle();
    }
  }

  // Function to add a new rectangle
  function addRectangle(startPoint, endPoint) {
    let newGeometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(12); // 4 vertices

    vertices[0] = startPoint.x;
    vertices[1] = startPoint.y;
    vertices[2] = startPoint.z;
    vertices[3] = endPoint.x;
    vertices[4] = startPoint.y;
    vertices[5] = startPoint.z;
    vertices[6] = endPoint.x;
    vertices[7] = endPoint.y;
    vertices[8] = startPoint.z;
    vertices[9] = startPoint.x;
    vertices[10] = endPoint.y;
    vertices[11] = startPoint.z;

    newGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    let newRect = new THREE.LineLoop(newGeometry, material);
    newRect.renderOrder = 999;
    scene.add(newRect);
  }

  function updateRectangle() {
    let positions = rect.geometry.attributes.position.array;
    positions[0] = startPoint.x;
    positions[1] = startPoint.y;
    positions[2] = startPoint.z;
    positions[3] = endPoint.x;
    positions[4] = startPoint.y;
    positions[5] = startPoint.z;
    positions[6] = endPoint.x;
    positions[7] = endPoint.y;
    positions[8] = startPoint.z;
    positions[9] = startPoint.x;
    positions[10] = endPoint.y;
    positions[11] = startPoint.z;
    rect.geometry.attributes.position.needsUpdate = true;
  }

  function onMouseUp(event) {
    if (isDrawing) {
      mouseIsPressed = false;
      endPoint = getMousePosition(event.clientX, event.clientY, canvas, camera);
      addRectangle(startPoint, endPoint);
    }
  }
}
