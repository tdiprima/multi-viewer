import * as THREE from 'three';
console.log("draw.js");

export function draw(scene, renderer, controls) {
  let isDrawing = false;
  let color = 0x000000;
  let size = 100;
  let smoothness = 32;

  // Set up event listeners
  renderer.domElement.addEventListener("mousedown", startDrawing);
  renderer.domElement.addEventListener("mousemove", draw);
  renderer.domElement.addEventListener("mouseup", stopDrawing);
  renderer.domElement.addEventListener("mouseout", stopDrawing);

  // Geometries
  function cube() {
    let geometry = new THREE.BoxGeometry(size, size, size);
    let material = new THREE.MeshBasicMaterial({ color });
    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    return cube;
  }

  function sphere() {
    let geometry = new THREE.SphereGeometry(size, smoothness, smoothness);
    let material = new THREE.MeshBasicMaterial( { color } );
    let sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    return sphere;
  }

  function circle() {
    let geometry = new THREE.CircleGeometry( size, smoothness );
    let material = new THREE.MeshBasicMaterial( { color } );
    let circle = new THREE.Mesh( geometry, material );
    scene.add( circle );

    return circle;
  }

  // Draw on canvas
  function draw(event) {
    if (isDrawing) {
      // Limit drawing to the image boundaries
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (mouseX >= 0 && mouseX < window.innerWidth && mouseY >= 0 && mouseY < window.innerHeight) {
        // Continue with drawing the geometry
        // let mesh = cube();
        let mesh = sphere();
        // let mesh = circle();

        let x = (event.clientX / window.innerWidth) * 2 - 1;
        let y = -(event.clientY / window.innerHeight) * 2 + 1;
        mesh.position.set(x, y, 0);
      } else {
        // Mouse is outside the image boundaries, so exit the function

      }
    }
  }

  // Start drawing
  function startDrawing(event) {
    isDrawing = true;
    controls.enabled = false;
    draw(event);
  }

  // Stop drawing
  function stopDrawing() {
    isDrawing = false;
    controls.enabled = true;
  }

}
