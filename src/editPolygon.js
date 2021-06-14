const editPolygon = function (button, overlay) {
  button.addEventListener('click', function () {
    toggleButton(this, 'btnOn', 'btn')
    Edit(this, overlay.fabricCanvas())
  })
}

// Position handling code borrowed from: http://fabricjs.com/custom-controls-polygon
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  // This function looks at the pointIndex of the control and returns the
  // current canvas position for that particular point.
  const x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x)
  const y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y)

  return fabric.util.transformPoint(
    {x: x, y: y},

    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix()
    )
  )
}

// Custom action handler makes the control change the current point.
function actionHandler(eventData, transform, x, y) {
  const polygon = transform.target
  const currentControl = polygon.controls[polygon.__corner]

  const mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
  const polygonBaseSize = polygon._getNonTransformedDimensions()
  const size = polygon._getTransformedDimensions(0, 0)
  const finalPointPosition = {
    x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
    y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
  }
  polygon.points[currentControl.pointIndex] = finalPointPosition
  return true
}

// Handles the object that changes dimensions, while maintaining the correct position.
function anchorWrapper(anchorIndex, fn) {
  return function (eventData, transform, x, y) {
    const fabricObject = transform.target

    const absolutePoint = fabric.util.transformPoint({
      x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
      y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y)
    }, fabricObject.calcTransformMatrix())
    const actionPerformed = fn(eventData, transform, x, y)
    // IMPORTANT!  VARIABLE 'newDim' NEEDS TO EXIST. Otherwise, the bounding box gets borked:

    const newDim = fabricObject._setPositionDimensions({}) // DO NOT TOUCH THIS VARIABLE.
    const polygonBaseSize = fabricObject._getNonTransformedDimensions()
    const newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x
    const newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
    return actionPerformed
  }
}

function getPolygon(canvas) {
  if (canvas.getActiveObject()) {
    // User selected object that they want to work on.
    return canvas.getActiveObject()
  } else {
    const x = canvas.getObjects('polygon')
    if (x.length === 0) {
      // No polygons exist on this canvas. User will get an alert message.
      return 'null'
    }
    if (x.length === 1) {
      // There's only one object; return that one.
      return x[0]
    } else {
      // User will get an alert message that they need to select which one they want.
      return 'null'
    }
  }
}

function Edit(button, canvas) {
  const fabricPolygon = getPolygon(canvas)

  if (isRealValue(fabricPolygon)) {
    canvas.setActiveObject(fabricPolygon)
    fabricPolygon.edit = !fabricPolygon.edit

    const cornerColor = getAColorThatShowsUp(fabricPolygon.stroke)

    if (fabricPolygon.edit) {
      const lastControl = fabricPolygon.points.length - 1
      fabricPolygon.cornerStyle = 'circle'
      fabricPolygon.cornerColor = cornerColor
      // Create one new control for each polygon point
      fabricPolygon.controls = fabricPolygon.points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
          actionName: 'modifyPolygon',
          pointIndex: index
        })
        return acc
      }, {})
    } else {
      fabricPolygon.cornerColor = cornerColor
      fabricPolygon.cornerStyle = 'rect'
      fabricPolygon.controls = fabric.Object.prototype.controls
    }
    fabricPolygon.hasBorders = !fabricPolygon.edit
    canvas.requestRenderAll()
  } else {
    toggleButton(button, 'btnOn', 'btn')
    alertMessage('Please select a polygon for editing.')
  }
}
