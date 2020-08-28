// markupTools.js

/**
 * POLYGON handler
 */
let roof = new fabric.Polyline();
let roofPoints = [];
let lines = [];
let lineCounter = 0;

let drawingObject = {
  type: '',
  background: '',
  border: ''
};

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function isRealValue(obj) {
  return obj && obj !== 'null' && obj !== 'undefined';
}

// POLYGON BUTTON
btnPolygon.addEventListener('click', function () {

  if (!canvas.isDrawingMode) {
    toggleButton(btnPolygon);
    if (drawingObject.type === "roof") {
      // drawing off
      drawingObject.type = "";
      canvas.off('mouse:down', addPoints);
      clear();
      // click-to-zoom on
      viewer.gestureSettingsMouse.clickToZoom = true;
    } else {
      // drawing on
      drawingObject.type = "roof";
      canvas.on('mouse:down', addPoints);
      // click-to-zoom off
      viewer.gestureSettingsMouse.clickToZoom = false;
    }
  }

});

function clear() {
  drawingObject.type = "";
  lines.forEach(function (value) {
    canvas.remove(value);
  });

  // clear arrays
  roofPoints = [];
  lines = [];
  lineCounter = 0;

}

// Canvas Drawing
let x = 0;
let y = 0;

// Double-click = finish.
canvas.on('mouse:dblclick', finishPolygon);

function finishPolygon() {

  if (lines.length > 0) {
    // length > 0; because "double-click happens"
    roof = makeRoof(roofPoints);

    if (Array.isArray(roof.points) && roof.points.length) {
      // makeRoof successful
      canvas.add(roof);
      canvas.renderAll();
    }

    // button reset
    toggleButton(btnPolygon);
    clear();
  }

}

function canvasSelect() {
  canvas.selection = true;
}

// Add points
function addPoints(options) {

  if (drawingObject.type === "roof") {
    canvas.selection = false;
    setStartingPoint(options); // set x,y
    // console.log(new Point(x, y))
    roofPoints.push(new Point(x, y));
    let points = [x, y, x, y];
    lines.push(new fabric.Line(points, {
      strokeWidth: 3,
      selectable: false,
      stroke: 'red'
    }));
    // }).setOriginX(x).setOriginY(y));
    canvas.add(lines[lineCounter]);
    lineCounter++;
    canvas.on('mouse:up', canvasSelect);
  } else {

    // Disable fabric selection; otherwise, you get the weird purple box.
    overlay._fabricCanvas.selection = false;
  }
}

function calculateLines(options) {
  if (isRealValue(lines[0]) && drawingObject.type === "roof") {
    setStartingPoint(options);
    lines[lineCounter - 1].set({
      "x2": x,
      "y2": y
    });
    canvas.renderAll();
  }
}

canvas.on('mouse:move', calculateLines);

/**
 * NOTES:
 * I tried getting the div of the viewer, then offsetLeft, offsetTop.
 * I tried getting the fabric canvas offset, and the OSD canvas offset.
 * They're exactly the same thing.
 */
let offset, event;

function setStartingPoint(options) {
  event = options.e;

  offset = canvas._offset; // fabric offset
  // canvasOffset = OpenSeadragon.getElementOffset(viewer.canvas); // Same exact thing.

  // Get click position
  x = event.offsetX ? (event.offsetX) : event.pageX - offset.left;
  y = event.offsetY ? (event.offsetY) : event.pageY - offset.top;
}

function makeRoof(roofPoints) {
  let left = findPaddingForRoof(roofPoints, 'x');
  let top = findPaddingForRoof(roofPoints, 'y');

  if (left !== 999999 && top !== 999999) {
    roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y));
  }

  // Return 'roof' (Polygon).
  return new fabric.Polygon(roofPoints, {
    strokeWidth: 3,
    fill: 'rgba(0,0,0,0)',
    stroke: 'green',
    left: left,
    top: top
    // stroke: '#58c'
  });
}

// coordinate = x or y.
function findPaddingForRoof(roofPoints, coordinate) {
  let result = 999999;
  for (let i = 0; i < lineCounter; i++) {
    if (roofPoints[i][coordinate] < result) {
      result = roofPoints[i][coordinate];
    }
  }
  return Math.abs(result);
}

// toolbar.js
// menu:
// <a id="btnPolygon${idx}" class="btn" href="#"><i class="fa fa-draw-polygon"></i> Draw polygon</a>
// button:
// let btnPolygon = `<button class="btn" id="btnPolygon${idx}"><i class='fas fa-draw-polygon'></i> Draw Polygon</button>&nbsp;&nbsp;`;
