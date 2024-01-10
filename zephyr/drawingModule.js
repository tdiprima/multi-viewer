// drawingModule.js
import * as THREE from 'three';
import {dumpObject, sceneDump} from './dumpObject.js';

export function enableDrawing(scene, camera, renderer, controls) {
  let btnDraw = document.getElementById("toggleButton");
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
  lineMaterial.polygonOffset = true;
  lineMaterial.polygonOffsetFactor = -1;
  lineMaterial.depthTest = false;
  lineMaterial.depthWrite = false;
  lineMaterial.transparent = true;
  lineMaterial.alphaTest = 0.5; // Adjust this value as needed

  let line;
  let currentPolygonPositions = []; // Store positions for current polygon
  let polygonPositions = []; // Store positions for each polygon
  const distanceThreshold = 0.1;
  let intersectableObjects = [];

  renderer.domElement.addEventListener('pointerdown', event => {
    // ivDump();
    // sceneDump(scene);

    if (isDrawing) {
      mouseIsPressed = true;

      intersectableObjects = [];

      // Build the intersectableObjects array
      // scene.children.forEach(child => {
      //   if (child instanceof THREE.LOD) {
      //     child.children.forEach(lodChild => {
      //       if (lodChild instanceof THREE.Mesh) {
      //         intersectableObjects.push(lodChild);
      //       } else if (lodChild instanceof THREE.Group) {
      //         lodChild.children.forEach(groupChild => {
      //           if (groupChild instanceof THREE.Mesh) {
      //             intersectableObjects.push(groupChild);
      //           }
      //         });
      //       }
      //     });
      //   }
      // });

      // Build the intersectableObjects array
      intersectableObjects = [];
      scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object.visible) {
          intersectableObjects.push(object);
        }
      });

      console.log("intersectableObjects:", intersectableObjects);
      console.log("scene.children:", scene.children);

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
      // let intersects = raycaster.intersectObjects(scene.children, true);
      let intersects = raycaster.intersectObjects(intersectableObjects, true);

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
