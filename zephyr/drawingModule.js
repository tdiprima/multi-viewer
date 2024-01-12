/**
 * Allows user to draw on an image.
 * Raycasting target meshes are the squares that rapture.js creates.
 */
import * as THREE from 'three';
import { dumpObject, imageViewerDump, objectProperties } from './dumpObject.js';

console.log("drawingModule.js");

export function enableDrawing(scene, camera, renderer, controls) {
  // let btnDraw = document.getElementById("toggleButton");
  let btnDraw = document.createElement("button");
  btnDraw.id = "toggleButton";
  btnDraw.innerHTML = "drawing toggle";
  let canvas = document.querySelector('canvas');
  document.body.insertBefore(btnDraw, canvas);

  // Make sure that the camera is correctly positioned and oriented in your scene.
  // The raycaster depends on the camera's view frustum to determine where to cast the ray.
  // But image does not get rendered if I do this(???)
  // camera.position.set(0, 0, 0);
  // camera.lookAt(new THREE.Vector3(0, 0, 0));
  // scene.add(camera);

  let isDrawing = false;
  let mouseIsPressed = false;
  let color = "#0000ff";

  btnDraw.addEventListener("click", function () {
    if (isDrawing) {
      isDrawing = false;
      controls.enabled = true;

      // Remove the mouse event listeners
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
    } else {
      // Drawing on
      isDrawing = true;
      controls.enabled = false;

      // Set up the mouse event listeners
      renderer.domElement.addEventListener("mousemove", onMouseMove);
      renderer.domElement.addEventListener("mouseup", onMouseUp);
    }
  });

  function ivDump() {
    scene.children.forEach(child => {
      if (child instanceof THREE.LOD) {
        console.log(`%c${dumpObject(child).join('\n')}`, "color: #00ff00;");
      }
    });
  }

  // Set up the raycaster and mouse vector
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  let lineMaterial = new THREE.LineBasicMaterial({color});

  // Dashed Line Issue Solution
  lineMaterial.polygonOffset = true; // Prevent z-fighting (which causes flicker)
  lineMaterial.polygonOffsetFactor = -1; // Push the polygon further away from the camera
  lineMaterial.depthTest = false;  // Render on top
  lineMaterial.depthWrite = false; // Object won't be occluded
  lineMaterial.transparent = true; // Material transparent
  lineMaterial.alphaTest = 0.5;    // Pixels with less than 50% opacity will not be rendered

  let line;
  let currentPolygonPositions = []; // Store positions for current polygon
  let polygonPositions = []; // Store positions for each polygon
  const distanceThreshold = 0.1;
  let objects = [];

  renderer.domElement.addEventListener('pointerdown', event => {
    // ivDump();
    // imageViewerDump(scene);

    if (isDrawing) {
      mouseIsPressed = true;

      // Build the objects array
      objects = [];
      scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object.visible) {
          objects.push(object);
        }
      });

      console.log("Intersectable Objects:", objects);
      // objectProperties(objects);

      // Create a new BufferAttribute for each line
      line = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);
      scene.add(line);

      currentPolygonPositions = []; // Start a new array for the current polygon's positions
    }
  });

  function onMouseMove(event) {
    if (isDrawing && mouseIsPressed) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // TESTING DIFFERENT INTERSECT OBJECTS
      // scene.children is just ImageViewer and Line, but we're passing recurse=true
      // console.log("\nTesting... scene.children");
      // let intersects = raycaster.intersectObjects(scene.children, true);

      // These are all of the squares
      console.log("\nTesting... squares");
      let intersects = raycaster.intersectObjects(objects, true);

      // console.log(intersects.length > 0);
      // console.log(raycaster.ray.direction);

      if (intersects.length > 0) {
        console.log('Intersected!');
        let point = intersects[0].point;

        // Check if it's the first vertex of the current polygon
        const isFirstVertex = currentPolygonPositions.length === 0;

        if (isFirstVertex) {
          currentPolygonPositions.push(point.x, point.y, point.z);
        } else {
          // DISTANCE CHECK
          const lastVertex = new THREE.Vector3().fromArray(currentPolygonPositions.slice(-3));
          const currentVertex = new THREE.Vector3(point.x, point.y, point.z);
          const distance = lastVertex.distanceTo(currentVertex);

          if (distance > distanceThreshold) {
            currentPolygonPositions.push(point.x, point.y, point.z); // Store the position in the current polygon's array
            line.geometry.setAttribute("position", new THREE.Float32BufferAttribute(currentPolygonPositions, 3)); // Use the current polygon's array for the line's position attribute
          }
        }

        if (line.geometry.attributes.position) {
          line.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        console.log("Raycasting didn't work.");
      }
    }
  }

  function onMouseUp() {
    if (isDrawing) {
      mouseIsPressed = false;

      // Draw the final line
      line.geometry.setDrawRange(0, currentPolygonPositions.length / 3);
      line.geometry.computeBoundingSphere();

      polygonPositions.push(currentPolygonPositions); // Store the current polygon's positions in the polygonPositions array
      currentPolygonPositions = []; // Clear the current polygon's array
    }
  }
}
