/**
 * Allows user to draw on an image.
 * Raycasting target meshes are the squares that rapture.js creates.
 */
import * as THREE from 'three';
import { dumpObject, imageViewerDump, objectProperties } from './dumpObject.js';

console.log("drawingModule.js");

export function enableDrawing(scene, camera, renderer, controls) {
  // console.log(`%c${dumpObject(scene).join('\n')}`, "color: #00ff00;");

  let btnDraw = document.createElement("button");
  btnDraw.id = "toggleButton";
  btnDraw.innerHTML = "drawing toggle";
  let canvas = document.querySelector('canvas');
  document.body.insertBefore(btnDraw, canvas);

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

  function arrow() {
    const dir = new THREE.Vector3( 1, 2, 0 );

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3( 0, 0, 0 );
    const length = 100;
    const hex = 0xff0000;

    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    scene.add( arrowHelper );
  }

  // Set up the raycaster and mouse vector
  let raycaster = new THREE.Raycaster();
  // console.log("raycaster", raycaster);
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
      // arrow();

      mouseIsPressed = true;

      // Build the objects array
      objects = [];
      scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object.visible) {
          objects.push(object);
        }
      });

      // console.log("Intersectable Objects:", objects);
      // objectProperties(objects);

      // Create a new BufferAttribute for each line
      line = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);
      scene.add(line);

      currentPolygonPositions = []; // Start a new array for the current polygon's positions
    }
  });

  function onMouseMove(event) {
    if (isDrawing && mouseIsPressed) {
      // Get the bounding rectangle of the renderer's DOM element
      const rect = renderer.domElement.getBoundingClientRect();

      // Adjust the mouse coordinates
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // TESTING DIFFERENT INTERSECT OBJECTS
      // scene.children is just ImageViewer and Line, but we're passing recurse=true
      // let intersects = raycaster.intersectObjects(scene.children, true);
      // These are all the squares
      let intersects = raycaster.intersectObjects(objects, true);

      // console.log(intersects.length > 0);
      // console.log(raycaster.ray.direction);

      if (intersects.length > 0) {
        console.log('Intersected!\n', intersects);
        console.log('Camera position:', camera.position);
        console.log('origin, direction:', raycaster.ray.direction, raycaster.ray.origin);

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
      }
      // else {
      //   console.log(intersects);
      // }
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
