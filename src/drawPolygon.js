/**
 * Allow user to draw a polygon on the image.
 * @param viewerInfo
 * @param viewer: OSD viewer object
 * @param overlay: fabric overlay object
 */
const drawPolygon = (viewerInfo, viewer, overlay) => {
  let idx = viewerInfo.idx
  let overlaycanvas = `osd-overlaycanvas-${idx + 1}`
  let btnDraw = document.getElementById(`btnDraw${idx}`)
  let mark = document.getElementById(`mark${idx}`)
  let canvas = this.__canvas = overlay.fabricCanvas()
  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML
  let src = `${config.appImages}delete-icon.png`

  canvas.on('mouse:over', evt => {
    fillPolygon(evt, canvas)
  })
  canvas.on('mouse:out', evt => {
    unfillPolygon(evt, canvas)
  })
  canvas.on('mouse:up', () => {
    turnDrawingOff(canvas, viewer)
  })
  canvas.on('path:created', opts => {
    pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer)
  })

  btnDraw.addEventListener('click', function () {
    toggleButton(this, 'btnOn', 'btn')
    // Toggle drawing
    if (canvas.isDrawingMode) {
      turnDrawingOff(canvas, viewer)
    } else {
      turnDrawingOn(canvas, viewer, paintBrush, mark)
    }
  })

  function turnDrawingOff(canvas, viewer) {
    canvas.isDrawingMode = false
    canvas.off('mouse:down', () => {
      setGestureSettings(canvas, viewer)
    })
    setOsdMove(viewer, true)
  }

  function turnDrawingOn(canvas, viewer, paintBrush, mark) {
    canvas.isDrawingMode = true
    canvas.on('mouse:down', () => {
      setGestureSettings(canvas, viewer)
    })
    paintBrush.color = mark.innerHTML
    paintBrush.width = 10 / viewer.viewport.getZoom(true)
    setOsdMove(viewer, false)
  }

  function pathCreatedHandler(options, button, canvas, paintBrush, viewer) {
    convertPathToPolygon(options.path, canvas, paintBrush)
    customizePolygonControls(options.path, canvas, viewer)
    toggleButton(button, 'btn', 'btnOn')
    canvas.off('path:created', () => {
      pathCreatedHandler(options, button, canvas, paintBrush, viewer)
    })
  }

  function setGestureSettings(canvas, viewer) {
    if (!canvas.getActiveObject()) {
      jQuery('.deleteBtn').remove()
      viewer.gestureSettingsMouse.clickToZoom = true
    } else {
      viewer.gestureSettingsMouse.clickToZoom = false
    }
  }

  function customizePolygonControls(obj, canvas, viewer) {
    obj.hasControls = false
    obj.lockMovementX = true
    obj.lockMovementY = true
    setupDeleteButton(canvas, viewer)
  }

  function addDeleteBtn(x, y) {
    jQuery('.deleteBtn').remove()
    let btnLeft = x - 10
    let btnTop = y - 10
    let deleteBtn = `<img src="${src}" class="deleteBtn" style="position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;"/>`
    // jQuery('.canvas-container').append(deleteBtn) // <- every canvas, which we don't want
    let cc = document.getElementById(overlaycanvas).closest('.canvas-container')
    // jQuery(cc).append(deleteBtn) // this could've been it, but there's more than one layer, so the button doesn't delete the object.
    let osdc = cc.parentElement.parentElement
    let chil = osdc.children
    // Each layer has a .canvas-container with a [id^=osd-overlaycanvas]
    for (let i = 0; i < chil.length; i++) {
      if (chil[i].hasChildNodes()) {
        let canvasContainer = chil[i].children[0]
        jQuery(canvasContainer).append(deleteBtn)
      }
    }
    // todo: this works, but 2nd viewer's object's delete button goes on 1st viewer canvas; delete button DOES work tho!
  }

  function setupDeleteButton(canvas, viewer) {
    canvas.on('selection:created', function (e) {
      addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
    })

    canvas.on('object:modified', function (e) {
      if (isRealValue(e.target.oCoords.tr)) {
        addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y)
      }
    })

    canvas.on('object:scaling', function (e) {
      jQuery('.deleteBtn').remove()
    })

    canvas.on('object:moving', function (e) {
      jQuery('.deleteBtn').remove()
    })

    canvas.on('object:rotating', function (e) {
      jQuery('.deleteBtn').remove()
    })

    jQuery('.canvas-container').on('click', '.deleteBtn', function (e) {
      viewer.gestureSettingsMouse.clickToZoom = false
      if (canvas.getActiveObject()) {
        canvas.remove(canvas.getActiveObject())
        let deleteButtons = jQuery('.deleteBtn')
        deleteButtons.remove()
      }
      viewer.gestureSettingsMouse.clickToZoom = true
    })
  }

  function convertPathToPolygon(pathObject, canvas, paintBrush) {
    const _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }))

    const cornerColor = getAColorThatShowsUp(pathObject.stroke)

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
    poly['setControlVisible']('tr', false)
    canvas.setActiveObject(poly)
    addDeleteBtn(poly.oCoords.tr.x, poly.oCoords.tr.y) // top-right x,y
    canvas.remove(pathObject)
  }

  function fillPolygon(pointerEvent, canvas) {
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

  function unfillPolygon(pointerEvent, canvas) {
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

  function weHoveredOverPolygon(pointerEvent) {
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
}
