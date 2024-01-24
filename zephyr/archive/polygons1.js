export function polygons(scene, camera, renderer, controls) {
  let vertices;
  let segments;
  let typeOfShape;
  let allMeshes = []; // Array to store all meshes

  // Material for the shapes
  let material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 10});

  // Handle mouse events
  let isDrawing = false;
  let startPoint = new THREE.Vector2(0, 0);
  let endPoint = new THREE.Vector2(0, 0);
  let points = []; // Points for polygon

  // Button event listeners
  let rectangleButton = createButton({
    id: "rectangle",
    innerHtml: "<i class=\"fa-regular fa-square\"></i>",
    title: "rectangle"
  });

  let ellipseButton = createButton({
    id: "ellipse",
    innerHtml: "<i class=\"fa-regular fa-circle\"></i>",
    title: "ellipse"
  });

  let polygonButton = createButton({
    id: "polygon",
    innerHtml: "<i class=\"fa-solid fa-draw-polygon\"></i>",
    title: "polygon"
  });

  // Button click handlers
  rectangleButton.addEventListener("click", function () {
    handler("rectangle");
  });

  ellipseButton.addEventListener("click", function () {
    handler("ellipse");
  });

  polygonButton.addEventListener("click", function () {
    handler("polygon");
    points = [];
  });

  function handler(type) {
    // Toggle drawing mode
    isDrawing = !isDrawing;
    console.log(isDrawing ? "drawing on" : "drawing off");
    controls.enabled = !isDrawing;

    // Add or remove event listeners
    const method = isDrawing ? 'addEventListener' : 'removeEventListener';
    renderer.domElement[method]("mousedown", onMouseDown, false);
    renderer.domElement[method]("mousemove", onMouseMove, false);
    renderer.domElement[method]("mouseup", onMouseUp, false);
    renderer.domElement[method]("dblclick", onDoubleClick, false);

    typeOfShape = type;
    initGeometry(); // Initialize geometry when button is clicked
  }

  // Set up geometry
  function initGeometry() {
    switch (typeOfShape) {
      case "rectangle":
        vertices = new Float32Array(12); // 4 vertices
        break;
      case "ellipse":
        segments = 64; // Number of line segments for the ellipse
        vertices = new Float32Array((segments + 1) * 3); // Vertices for the ellipse
        break;
      case "polygon":
        vertices = new Float32Array(positions);
        break;
      default:
        console.log("Invalid shape type");
        return;
    }
  }

  function onMouseDown(event) {
    if (isDrawing) {
      startPoint = getMousePosition(event.clientX, event.clientY);
      points.push(startPoint.clone());
    }
  }

  function onMouseMove(event) {
    if (isDrawing) {
      endPoint = getMousePosition(event.clientX, event.clientY);
      points[points.length - 1] = endPoint.clone();
      updateMesh();
    }
  }

  function onMouseUp(event) {
    if (typeOfShape !== "polygon") {
      isDrawing = false;
      let newGeometry = new THREE.BufferGeometry();
      newGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      addMesh(newGeometry, material);
      points = [];
    }
  }

  function onDoubleClick(event) {
    if (typeOfShape === "polygon") {
      if (isDrawing && points.length >= 3) {
        isDrawing = false;
        points.pop(); // Remove the duplicated point from double-click
        updateMesh();
        let newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        addMesh(newGeometry, material);
        points = [];
      }
    }
  }

  // Add a new mesh to the scene
  function addMesh(geometry, material) {
    let newMesh = new THREE.LineLoop(geometry, material);
    newMesh.renderOrder = 999;
    scene.add(newMesh);
    allMeshes.push(newMesh);
  }

  // Functions to update the mesh based on the shape
  const updateRectangle = function () {
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
  }

  const updateEllipse = function () {
    let center = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
    let radiusX = Math.abs(startPoint.x - endPoint.x) * 0.5;
    let radiusY = Math.abs(startPoint.y - endPoint.y) * 0.5;

    for (let i = 0; i <= segments; i++) {
      let theta = (i / segments) * Math.PI * 2;
      let x = center.x + Math.cos(theta) * radiusX;
      let y = center.y + Math.sin(theta) * radiusY;
      vertices[i * 3] = x;
      vertices[i * 3 + 1] = y;
      vertices[i * 3 + 2] = 0;
    }
  }

  const updatePolygon = function () {
    let numPoints = points.length;
    if (numPoints > 0) {
      vertices = new Float32Array(numPoints * 3);
      for (let i = 0; i < numPoints; i++) {
        vertices[i * 3] = points[i].x;
        vertices[i * 3 + 1] = points[i].y;
        vertices[i * 3 + 2] = points[i].z;
      }
    }
  }

  // Function to update the current mesh
  function updateMesh() {
    switch (typeOfShape) {
      case "rectangle":
        updateRectangle();
        break;
      case "ellipse":
        updateEllipse();
        break;
      case "polygon":
        updatePolygon();
        break;
      default:
        console.log("Invalid shape type");
    }
  }

  // Function to get mouse position
  function getMousePosition(clientX, clientY) {
    // Get the size and position of the canvas element
    let domRect = renderer.domElement.getBoundingClientRect();

    // Normalize mouse coordinates
    let mouse = new THREE.Vector2();
    mouse.x = ((clientX - domRect.left) / domRect.width) * 2 - 1;
    mouse.y = -((clientY - domRect.top) / domRect.height) * 2 + 1;

    // Initialize our Raycaster
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera); // set raycaster's origin and direction

    // Define an intersection point
    let intersectionPoint = new THREE.Vector3();
    // Calculate intersection with plane
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1)), intersectionPoint);

    return intersectionPoint;
  }
}
