function drawPolygon (idx, viewer, overlay) {
  const btnDraw = document.getElementById('btnDraw' + idx)
  const mark = document.getElementById('mark' + idx)

  const canvas = overlay.fabricCanvas()

  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML

  let textBox

  canvas.on('mouse:over', mouseOver)
  canvas.on('mouse:out', mouseOut)

  btnDraw.addEventListener('click', function () {
    toggleButtonHighlight(btnDraw)

    canvas.on('mouse:up', mouseupHandler)
    canvas.on('path:created', pathCreatedHandler)

    function pathCreatedHandler (options) {
      console.log('options', options)
      pathToPoly(options.path, canvas, paintBrush)

      customizeControls(options.path)

      clearClassList(btnDraw)

      btnDraw.classList.add('btn')
      canvas.off('path:created', pathCreatedHandler)
    }

    function mouseupHandler (options) {
      console.log('options', options)
      canvas.isDrawingMode = false
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
    }

    function mousedownHandler (options) {
      console.log('options', options)
      if (!canvas.getActiveObject()) {
        $('.deleteBtn').remove()
        viewer.gestureSettingsMouse.clickToZoom = true
      } else {
        viewer.gestureSettingsMouse.clickToZoom = false
      }
    }

    if (canvas.isDrawingMode) {
      canvas.isDrawingMode = false
      canvas.off('mouse:down', mousedownHandler)
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
    } else {
      canvas.isDrawingMode = true
      canvas.on('mouse:down', mousedownHandler)
      paintBrush.color = mark.innerHTML
      paintBrush.width = 10 / viewer.viewport.getZoom(true)
      viewer.setMouseNavEnabled(false)
      viewer.outerTracker.setTracking(false)
    }
  })

  function customizeControls (obj) {
    obj.hasControls = false
    obj.lockMovementX = true
    obj.lockMovementY = true

    function addDeleteBtn (x, y) {
      $('.deleteBtn').remove()
      const btnLeft = x - 10
      const btnTop = y - 10
      const deleteBtn = `<img src="img/delete-icon.png" class="deleteBtn" style="position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;"/>`
      $('.canvas-container').append(deleteBtn)
    }

    canvas.on('selection:created', function (e) {
      addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
    })

    canvas.on('mouse:down', function (e) {
      if (!canvas.getActiveObject()) {
        $('.deleteBtn').remove()
        viewer.gestureSettingsMouse.clickToZoom = true
      } else {
        viewer.gestureSettingsMouse.clickToZoom = false
      }
    })

    canvas.on('object:modified', function (e) {
      addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
    })

    canvas.on('object:scaling', function (e) {
      $('.deleteBtn').remove()
    })

    canvas.on('object:moving', function (e) {
      $('.deleteBtn').remove()
    })

    canvas.on('object:rotating', function (e) {
      $('.deleteBtn').remove()
    })

    $('.canvas-container').on('click', '.deleteBtn', function () {
      viewer.gestureSettingsMouse.clickToZoom = false
      if (canvas.getActiveObject()) {
        canvas.remove(canvas.getActiveObject())
        $('.deleteBtn').remove()
      }
      viewer.gestureSettingsMouse.clickToZoom = true
    })
  }

  function pathToPoly (pathObject, canvas, paintBrush) {
    const _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }))

    const cornerColor = getACornerColorThatShowsUp(pathObject.stroke)

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

  function mouseOver (e) {
    try {
      const obj = e.target
      const type = obj.type
      if (isRealValue(obj) && type === 'polygon') { // no 'line', no 'rect' (gridOverlay).
        obj.set({
          fill: obj.stroke,
          opacity: 0.5
        })

        const left = obj.left
        const top = obj.top

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
        obj.set({
          fill: ''
        })

        canvas.remove(textBox)
        canvas.renderAll()
      }
    } catch (e) {
      // console.log('eee', e.message);
    }
  }
}
