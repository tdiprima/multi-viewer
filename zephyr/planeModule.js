/**
 * Create a plane and allow user to draw on it.
 * Try raycasting against scene.children and try raycasting against the plane.
 */
import * as THREE from 'three';

console.log("planeModule.js");

export function addPlane(scene, camera, renderer) {
  let plane;
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

}
