/**
 * Allow user to draw a polygon on the image.
 * @param idx
 * @param viewer: OSD viewer object
 * @param overlay: fabric overlay object
 */
const drawPolygon = (idx, viewer, overlay) => {
  let overlaycanvas = `osd-overlaycanvas-${idx + 1}`
  let btnDraw = document.getElementById('btnDraw' + idx)
  let mark = document.getElementById('mark' + idx)
  let canvas = this.__canvas = overlay.fabricCanvas()
  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML

  canvas.on('mouse:over', evt => { fillPolygon(evt, canvas) })
  canvas.on('mouse:out', evt => { unfillPolygon(evt, canvas) })
  canvas.on('mouse:up', () => { turnDrawingOff(canvas, viewer) })
  canvas.on('path:created', opts => { pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer) })

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
    canvas.off('mouse:down', () => { setGestureSettings(canvas, viewer) })
    setOsdMove(viewer, true)
  }

  function turnDrawingOn(canvas, viewer, paintBrush, mark) {
    canvas.isDrawingMode = true
    canvas.on('mouse:down', () => { setGestureSettings(canvas, viewer) })
    paintBrush.color = mark.innerHTML
    paintBrush.width = 10 / viewer.viewport.getZoom(true)
    setOsdMove(viewer, false)
  }

  function pathCreatedHandler(options, button, canvas, paintBrush, viewer) {
    convertPathToPolygon(options.path, canvas, paintBrush)
    customizePolygonControls(options.path, canvas, viewer)
    toggleButton(button, 'btn', 'btnOn')
    canvas.off('path:created', () => { pathCreatedHandler(options, button, canvas, paintBrush, viewer) })
  }

  function setGestureSettings(canvas, viewer) {
    if (!canvas.getActiveObject()) {
      $('.deleteBtn').remove()
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

  let thisCanvas

  function addDeleteBtn(x, y) {
    jQuery('.deleteBtn').remove() // Remove before adding again
    let btnLeft = x - 10
    const btnTop = y - 15

    let src = `${config.appImages}delete-icon.png`
    // let deleteBtn = `<img src="${src}" class="deleteBtn" style="position:absolute; top:${btnTop}px; left:${btnLeft}px; cursor:pointer;"/>`
    let deleteBtn = e('img', {'src': src, 'class': 'deleteBtn'})
    thisCanvas = document.getElementById(overlaycanvas).closest('.canvas-container')
    // console.log('thisCanvas', thisCanvas) //'.canvas-container'
    deleteBtn.setAttribute('style', `position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;`);
    // jQuery(thisCanvas).append(deleteBtn)
    thisCanvas.append(deleteBtn)

  }

  function setupDeleteButton(canvas, viewer) {
    canvas.on('selection:created', e => { addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y) })
    canvas.on('object:modified', e => { addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y) })
    canvas.on('object:scaling', e => { jQuery('.deleteBtn').remove() })
    canvas.on('object:moving', e => { jQuery('.deleteBtn').remove() })
    canvas.on('object:rotating', e => { jQuery('.deleteBtn').remove() })

    jQuery(thisCanvas).on('click', '.deleteBtn', () => {
      viewer.gestureSettingsMouse.clickToZoom = false
      if (canvas.getActiveObject()) {
        canvas.remove(canvas.getActiveObject())
        jQuery('.deleteBtn').remove()
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
      transparentCorners: true,
      cornerColor: cornerColor
    })
    poly['setControlVisible']('tr', false)
    canvas.add(poly).setActiveObject(poly)
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
