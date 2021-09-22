/**
 * Allow user to draw a polygon on the image.
 * @param viewerInfo
 * @param viewer: OSD viewer object
 * @param overlay: fabric overlay object
 */
const drawPolygon = (viewerInfo, viewer, overlay) => {
  let idx = viewerInfo.idx
  let overlaycanvas = `osd-overlaycanvas-${idx + 1}`
  console.log(`%cidx ${idx}`, 'color: #ccff00;')
  let btnDraw = document.getElementById(`btnDraw${idx}`)
  let mark = document.getElementById(`mark${idx}`)
  let canvas = this.__canvas = overlay.fabricCanvas()
  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  paintBrush.decimate = 20
  paintBrush.color = mark.innerHTML

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

  // let oc1 = `osd-overlaycanvas-${idx + 1}` // HARDCODED
  // let oc2 = `osd-overlaycanvas-${idx + 2}`

  let canvii = $('.canvas-container')
  // console.log(typeof canvii) // OBJECT
  // console.log(`%c${Array.isArray(canvii)}`, 'color: deeppink;') // FALSE.
  console.log(canvii)
  // $('.canvas-container').each(function( index, eh ) {
  //   console.log( index + ": " + $( this ) ) // object
  //   // console.log('eh', eh) // div
  // })

  function addDeleteBtn(x, y) {
    $('.deleteBtn').remove()
    let btnLeft = x - 10
    let btnTop = y - 10
    let deleteBtn = `<img src="images/delete-icon.png" class="deleteBtn" style="position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;"/>`
    // $('.canvas-container').append(deleteBtn) // <- every canvas, which we don't want

    // $(".openseadragon-canvas").each(function (index, elem) {
    //   console.log("I am " + index + "th element.");
    //   console.log('this', $(this)) // jQuery element
    //   // console.log('elem', elem) // DOM element
    // });

    // let elm = document.createElement("div")
    // let jelm = $(elm) //convert to jQuery Element
    // let htmlElm = jelm[0] //convert to HTML Element

    // For this viewer, for as many layers as there are, we have to add a button
    // console.log($('.canvas-container').find(overlaycanvas))

    let cc = document.getElementById(overlaycanvas).closest('.canvas-container')
    let ccp = cc.parentElement
    let osdc = ccp.parentElement
    // console.log('cc', cc)
    console.log('osdc', osdc)
    let chil = osdc.children

    for (let i = 0; i < chil.length; i++) {
      if (chil[i].hasChildNodes()) {
        let ccc = chil[i].children[0]
        console.log('ccc', ccc)
        $(ccc).append(deleteBtn)
      }
    }
    // console.log('YAY', $(osdc).children("[id^=osd-overlaycanvas]"))


    // TESTING 1
    // for (let i = 0; i < canvii.length; i++) {
    //   for (let j = 0; j < viewerInfo.len; j++) {
    //     console.log(canvii[i].firstChild.id, `osd-overlaycanvas-${idx + j + 1}`)
    //     if (canvii[i].firstChild.id === `osd-overlaycanvas-${idx + j + 1}`) {
    //       $(canvii[i]).append(deleteBtn)
    //     }
    //   }
    // }

    // 2
    // for (let i = 0; i < canvii.length; i++) {
    //   if (canvii[i].firstChild.id === oc1 || canvii[i].firstChild.id === oc2) {
    //     $(canvii[i]).append(deleteBtn)
    //   }
    // }
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
      $('.deleteBtn').remove()
    })

    canvas.on('object:moving', function (e) {
      $('.deleteBtn').remove()
    })

    canvas.on('object:rotating', function (e) {
      $('.deleteBtn').remove()
    })

    $('.canvas-container').on('click', '.deleteBtn', function (e) {
      viewer.gestureSettingsMouse.clickToZoom = false
      if (canvas.getActiveObject()) {
        console.log('getActiveObject()', canvas.getActiveObject())
        canvas.remove(canvas.getActiveObject())
        let deleteButtons = $('.deleteBtn')
        console.log(deleteButtons)
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
