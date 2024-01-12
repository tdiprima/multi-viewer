/**
 * Create a plane and allow user to draw on it.
 * Try raycasting against scene.children and try raycasting against the plane.
 */
import * as THREE from 'three';

console.log("planeModule.js");

export function addPlane(scene, camera, renderer, controls) {
  // let btnDraw = document.getElementById("toggleButton");
  let btnDraw = document.createElement("button");
  btnDraw.id = "addPlane";
  btnDraw.innerHTML = "draw on plane";
  let canvas = document.querySelector('canvas');
  document.body.insertBefore(btnDraw, canvas);

  let isDrawing = false;
  let mouseIsPressed = false;
  let color = "#0000ff";
  let plane;

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

  function plane1() {
    // Set up geometry to raycast against
    // let aspectRatio = window.innerWidth / window.innerHeight;
    // let planeWidth = 16;
    // let planeHeight = planeWidth / aspectRatio;
    // console.log(planeWidth, planeHeight);

    // let planeGeom = new THREE.PlaneGeometry(planeWidth, planeHeight);
    let planeGeom = new THREE.PlaneGeometry(1000, 1000);
    let planeMat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, side: THREE.DoubleSide});
    let planeMesh = new THREE.Mesh(planeGeom, planeMat);
    planeMesh.name = "plane";
    scene.add(planeMesh);

    return planeMesh;
  }

  plane = plane1();

  function plane2() {
    // Create the plane geometry
    let planeGeometry = new THREE.PlaneGeometry(1000, 1000); // Large enough size

    // Create a transparent material
    let planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      depthTest: false
    });

    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.name = "plane";

    // Add plane to the camera
    camera.add(planeMesh);

    // Position the plane in front of the camera
    planeMesh.position.set(0, 0, -1);

    // Set a high render order
    planeMesh.renderOrder = 999;

    // Add the camera to the scene (because it has not already been added, afaik)
    scene.add(camera);

    // Be a static object in the scene:
    scene.add(planeMesh);

    // Render the scene
    renderer.render(scene, camera);

    return planeMesh;
  }

  // plane = plane2();

  let objects = [plane];

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

  renderer.domElement.addEventListener('pointerdown', event => {
    if (isDrawing) {
      mouseIsPressed = true;

      console.log("objects:", objects);
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

      // console.log("Testing... scene.children");
      // let intersects = raycaster.intersectObjects(scene.children, true);

      console.log("Testing... [plane]");
      let intersects = raycaster.intersectObjects(objects, true);

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
