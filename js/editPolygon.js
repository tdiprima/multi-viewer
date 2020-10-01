// Locate the controls.
function polygonPositionHandler (dim, finalMatrix, fabricObject) {
  // Do for all points
  const x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x
  const y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y
  return fabric.util.transformPoint(
    { x: x, y: y },
    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix()
    )
  )
}

// This function will be called on every mouse move after a control has been
// clicked and is being dragged.
function actionHandler (eventData, transform, x, y) {
  // polygon.__corner is the handle that you dragged.
  const polygon = transform.target
  const currentControl = polygon.controls[polygon.__corner]
  const mouseLocalPosition = polygon.toLocalPoint(
    new fabric.Point(x, y),
    'center',
    'center'
  )
  const polygonBaseSize = polygon._getNonTransformedDimensions()
  const size = polygon._getTransformedDimensions(0, 0)
  const finalPointPosition = {
    x:
      (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
      polygon.pathOffset.x,
    y:
      (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
      polygon.pathOffset.y
  }
  polygon.points[currentControl.pointIndex] = finalPointPosition
  return true
}

// Keep the polygon in the same position when we change its
// width/height/top/left.
function anchorWrapper (anchorIndex, fn) {
  // Once per button click when edit = yes.
  return function (eventData, transform, x, y) {
    const fabricObject = transform.target
    const absolutePoint = fabric.util.transformPoint(
      {
        x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
        y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
      },
      fabricObject.calcTransformMatrix()
    )
    const actionPerformed = fn(eventData, transform, x, y)
    // IMPORTANT! Fabric is using newDim!! Do not touch!!
    const newDim = fabricObject._setPositionDimensions({})
    const polygonBaseSize = fabricObject._getNonTransformedDimensions()
    const newX =
      (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
      polygonBaseSize.x
    const newY =
      (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
      polygonBaseSize.y
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
    return actionPerformed
  }
}

function getPolygon (canvas) {
  if (canvas.getActiveObject()) {
    // If one is selected, that's the one they want to work on.
    return canvas.getActiveObject()
  } else {
    const x = canvas.getObjects('polygon')
    if (x.length === 0) {
      // No polygons
      return 'null'
    }
    if (x.length === 1) {
      // Return the first one
      return x[0]
    } else {
      // Tell me which one you want
      return 'null'
    }
  }
}

function editPolygon (idx, overlay) {
  // Edit button event listener
  document.getElementById('btnEdit' + idx).addEventListener('click', function () {
    toggleButton(this)
    Edit(overlay.fabricCanvas())
  })
}

function Edit (canvas) {
  const fabricPolygon = getPolygon(canvas)

  if (isRealValue(fabricPolygon)) {
    // console.log("instance of Polygon:", fabricPolygon instanceof fabric.Polygon);
    canvas.setActiveObject(fabricPolygon)
    fabricPolygon.edit = !fabricPolygon.edit
    const cornerColor = getACornerColorThatShowsUp(fabricPolygon.stroke)
    if (fabricPolygon.edit) {
      const lastControl = fabricPolygon.points.length - 1
      fabricPolygon.cornerStyle = 'circle'
      fabricPolygon.cornerColor = cornerColor

      // accumulator, next item, index
      const reduceFun = function (acc, point, index) {
        // Create a control object for each polygon point
        acc['p' + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
          actionName: 'modifyPolygon',
          pointIndex: index
        })
        return acc
      }

      // Create a control buddy [hashtable]. Point p0 = corresponding Control object.
      // function, initial value
      fabricPolygon.controls = fabricPolygon.points.reduce(reduceFun, {})
    } else {
      fabricPolygon.cornerColor = cornerColor
      fabricPolygon.cornerStyle = 'rect'
      // Default controls:
      fabricPolygon.controls = fabric.Object.prototype.controls
    }
    fabricPolygon.hasBorders = !fabricPolygon.edit
    canvas.requestRenderAll()
  } else {
    alertMessage('Please select a polygon for editing.')
  }
}
