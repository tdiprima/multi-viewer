// This is the free-drawing handler
function drawPolygon (idx, viewer, overlay) {
  const canvas = overlay.fabricCanvas()
  const btnDraw = document.getElementById('btnDraw' + idx)
  const mark = document.getElementById('mark' + idx)
  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML

  function addDeleteBtn (x, y, el) {
    $('.deleteBtn').remove()
    const btnLeft = x - 10
    const btnTop = y - 10
    const deleteBtn = document.createElement('img')
    deleteBtn.src = './img/delete-icon.png'
    deleteBtn.classList.add('deleteBtn')
    deleteBtn.style = `position:absolute;top:${btnTop};left:${btnLeft};cursor:pointer;width:20px;height:20px;`
    deleteBtn.alt = 'delete object'
    el.appendChild(deleteBtn)
  }

  function checkCoords (e, c) {
    const el = c.lowerCanvasEl.parentElement
    if (isRealValue(e.target.oCoords.tr) && isRealValue(el)) {
      addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el)
    }
  }

  function customizeControls (obj) {
    // For the object that was drawn
    obj.hasControls = false
    obj.lockMovementX = true // hold in place
    obj.lockMovementY = true

    canvas.on('selection:created', function (e) {
      checkCoords(e, canvas)
    })

    // It's not movable/scalable/etc now, but it might be one day.
    canvas.on('object:modified', function (e) {
      checkCoords(e, canvas)
    })

    canvas.on('object:scaling', function (e) {
      $('.deleteBtn').remove()
      checkCoords(e, canvas)
    })

    canvas.on('object:moving', function (e) {
      $('.deleteBtn').remove()
      checkCoords(e, canvas)
    })

    canvas.on('object:rotating', function (e) {
      $('.deleteBtn').remove()
      checkCoords(e, canvas)
    })

    $('.canvas-container').on('click', '.deleteBtn', function () {
      viewer.gestureSettingsMouse.clickToZoom = false
      // this = deleteBtn
      if (canvas.getActiveObject()) {
        canvas.remove(canvas.getActiveObject())
        $('.deleteBtn').remove()
      }
      // Delete finished; re-enable zoom.
      viewer.gestureSettingsMouse.clickToZoom = true
    })
  }

  // Convert Path obj to Polygon obj
  function pathToPoly (pathObject, canvas, paintBrush) {
    // Convert path points
    const _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }))

    // Set corner color for new object
    const cornerColor = getACornerColorThatShowsUp(pathObject.stroke)

    // Create polygon object
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

  // DRAW BUTTON EVENT HANDLER
  btnDraw.addEventListener('click', function () {
    toggleButton(btnDraw)
    canvas.on('mouse:up', mouseupHandler)
    canvas.on('path:created', pathCreatedHandler)

    // Because we need the object that we just created.
    function pathCreatedHandler (options) {
      // console.log('pathCreatedHandler')

      // 'options' gives you the Path object
      pathToPoly(options.path, canvas, paintBrush)
      customizeControls(options.path)
      clearClassList(btnDraw)
      btnDraw.classList.add('btn')

      // canvas.off('mouse:down', mousedownHandler);
      // canvas.off("mouse:up", mouseupHandler);
      // console.log('PATH:\n', path);
      canvas.off('path:created', pathCreatedHandler)
    }

    function mouseupHandler (options) {
      // 'options' contains mouse pointer coordinates stuff

      // drawing off
      canvas.isDrawingMode = false
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
    }

    function mousedownHandler () {
      // For example, panning or zooming after selection
      if (!canvas.getActiveObject()) {
        $('.deleteBtn').remove()
        viewer.gestureSettingsMouse.clickToZoom = true
      } else {
        // Prevent zoom on delete.
        viewer.gestureSettingsMouse.clickToZoom = false
      }
    }

    if (canvas.isDrawingMode) {
      // drawing off
      canvas.isDrawingMode = false
      canvas.off('mouse:down', mousedownHandler)
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
    } else {
      // drawing on
      canvas.isDrawingMode = true
      canvas.on('mouse:down', mousedownHandler)
      paintBrush.color = mark.innerHTML
      paintBrush.width = 10 / viewer.viewport.getZoom(true)
      viewer.setMouseNavEnabled(false)
      viewer.outerTracker.setTracking(false)
    }
  })

  // HOVER
  canvas.on('mouse:over', mouseOver)
  canvas.on('mouse:out', mouseOut)

  let textBox
  function mouseOver (e) {
    try {
      const obj = e.target
      const type = obj.type
      if (isRealValue(obj) && type === 'polygon') { // no 'line', no 'rect' (gridOverlay).
        // TARGET FILL
        obj.set({
          fill: obj.stroke,
          opacity: 0.5
        })

        // TEXT
        const left = obj.left; const top = obj.top
        // JSON.stringify(canvas.toJSON())
        textBox = new fabric.Text(type, {
          fontSize: 18,
          fontFamily: 'Courier',
          backgroundColor: 'rgba(102, 102, 102, 0.7)',
          stroke: 'rgba(255, 255, 255, 1)',
          fill: 'rgba(255, 255, 255, 1)',
          left: left, // pointer.x,
          top: top // pointer.y
        })
        canvas.add(textBox)
        canvas.renderAll()
      }
    } catch (e) {
      // console.log('eee', e.message);
    }
  }

  function mouseOut (e) {
    try {
      const obj = e.target
      if (obj !== null) {
        // TARGET FILL
        obj.set({
          fill: ''
        })

        // REMOVE TEXT
        canvas.remove(textBox)
        canvas.renderAll()
      }
    } catch (e) {
      // console.log('eee', e.message);
    }
  }
}
