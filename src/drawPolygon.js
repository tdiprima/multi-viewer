// eslint-disable-next-line no-unused-vars
const drawPolygon = function (idx, viewer, overlay) {
  const btnDraw = document.getElementById('btnDraw' + idx)
  const mark = document.getElementById('mark' + idx)

  const canvas = overlay.fabricCanvas()

  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas) // eslint-disable-line no-undef
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML

  canvas.on('mouse:over', function (evt) {
    fillPolygon(evt, canvas)
  })

  canvas.on('mouse:out', function (evt) {
    unfillPolygon(evt, canvas)
  })

  canvas.on('mouse:up', function () {
    turnDrawingOff(canvas, viewer)
  })

  canvas.on('path:created', function (opts) {
    pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer)
  })

  btnDraw.addEventListener('click', function () {
    toggleButtonHighlight(this) // eslint-disable-line no-undef

    if (canvas.isDrawingMode) {
      turnDrawingOff(canvas, viewer)
    } else {
      turnDrawingOn(canvas, viewer, paintBrush, mark)
    }
  })
}

function turnDrawingOff (canvas, viewer) {
  canvas.isDrawingMode = false

  canvas.off('mouse:down', function () {
    setGestureSettings(canvas, viewer)
  })

  viewer.setMouseNavEnabled(true)
  viewer.outerTracker.setTracking(true)
}

function turnDrawingOn (canvas, viewer, paintBrush, mark) {
  canvas.isDrawingMode = true

  canvas.on('mouse:down', function () {
    setGestureSettings(canvas, viewer)
  })

  paintBrush.color = mark.innerHTML
  paintBrush.width = 10 / viewer.viewport.getZoom(true)

  viewer.setMouseNavEnabled(false)
  viewer.outerTracker.setTracking(false)
}

function pathCreatedHandler (options, button, canvas, paintBrush, viewer) {
  convertPathToPolygon(options.path, canvas, paintBrush)

  customizePolygonControls(options.path, canvas, viewer)

  clearClassList(button) // eslint-disable-line no-undef

  button.classList.add('btn')

  canvas.off('path:created', function () {
    pathCreatedHandler(options, button, canvas, paintBrush, viewer)
  })
}

function setGestureSettings (canvas, viewer) {
  if (!canvas.getActiveObject()) {
    $('.deleteBtn').remove() // eslint-disable-line no-undef
    viewer.gestureSettingsMouse.clickToZoom = true
  } else {
    viewer.gestureSettingsMouse.clickToZoom = false
  }
}

function customizePolygonControls (obj, canvas, viewer) {
  obj.hasControls = false
  obj.lockMovementX = true
  obj.lockMovementY = true

  setupDeleteButton(canvas, viewer)
}

function setupDeleteButton (canvas, viewer) {
  function addDeleteBtn (x, y) {
    $('.deleteBtn').remove() // eslint-disable-line no-undef
    const btnLeft = x - 10
    const btnTop = y - 10
    const deleteBtn = `<img src="images/delete-icon.png" class="deleteBtn" style="position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;"/>`
    $('.canvas-container').append(deleteBtn) // eslint-disable-line no-undef
  }

  canvas.on('selection:created', function (e) {
    addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
  })

  canvas.on('object:modified', function (e) {
    // eslint-disable-next-line no-undef
    if (isRealValue(e.target.oCoords.tr)) {
      addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
    }
  })

  canvas.on('object:scaling', function (e) {
    $('.deleteBtn').remove() // eslint-disable-line no-undef
  })

  canvas.on('object:moving', function (e) {
    $('.deleteBtn').remove() // eslint-disable-line no-undef
  })

  canvas.on('object:rotating', function (e) {
    $('.deleteBtn').remove() // eslint-disable-line no-undef
  })

  // eslint-disable-next-line no-undef
  $('.canvas-container').on('click', '.deleteBtn', function () {
    viewer.gestureSettingsMouse.clickToZoom = false
    if (canvas.getActiveObject()) {
      canvas.remove(canvas.getActiveObject())
      $('.deleteBtn').remove() // eslint-disable-line no-undef
    }
    viewer.gestureSettingsMouse.clickToZoom = true
  })
}

function convertPathToPolygon (pathObject, canvas, paintBrush) {
  const _points0 = pathObject.path.map(item => ({
    x: item[1],
    y: item[2]
  }))

  const cornerColor = getAColorThatShowsUp(pathObject.stroke) // eslint-disable-line no-undef

  // eslint-disable-next-line no-undef
  const poly = new fabric.Polygon(_points0, {
    left: pathObject.left,
    top: pathObject.top,
    fill: '',
    strokeWidth: paintBrush.width,
    stroke: paintBrush.color,
    scaleX: pathObject.scaleX,
    scaleY: pathObject.scaleY,
    objectCaching: false,
    transparentCorners: false,
    cornerColor: cornerColor
  })
  canvas.add(poly)
  canvas.setActiveObject(poly)
  canvas.remove(pathObject)
}

function fillPolygon (pointerEvent, canvas) {
  if (weHoveredOverPolygon(pointerEvent)) {
    const obj = pointerEvent.target

    obj.set({
      fill: obj.stroke,
      opacity: 0.5
    })

    // displayInfo()

    canvas.renderAll()
  }
}

function unfillPolygon (pointerEvent, canvas) {
  if (weHoveredOverPolygon(pointerEvent)) {
    const obj = pointerEvent.target
    if (obj !== null) {
      obj.set({
        fill: ''
      })

      // canvas.remove(infoText)
      canvas.renderAll()
    }
  }
}

function weHoveredOverPolygon (pointerEvent) {
  // eslint-disable-next-line no-undef
  return (isRealValue(pointerEvent.target) && pointerEvent.target.type === 'polygon')
}

// function displayInfo (obj, canvas) {
//   // Display some kind of information. TBA.
//   // Right now this displays what type of object it is. (Polygon, obviously.)
//   const type = obj.type
//   const left = obj.left
//   const top = obj.top
//
//   const infoText = new fabric.Text(type, {
//     fontSize: 18,
//     fontFamily: 'Courier',
//     backgroundColor: 'rgba(102, 102, 102, 0.7)',
//     stroke: 'rgba(255, 255, 255, 1)',
//     fill: 'rgba(255, 255, 255, 1)',
//     left: left, // pointer.x,
//     top: top // pointer.y
//   })
//   canvas.add(infoText)
// }