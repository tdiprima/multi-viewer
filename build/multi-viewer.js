/*! multi-viewer - v2.4.8 - 2021-05-07 */
// Utilizes: https://github.com/taufik-nurrohman/color-picker
const colorPicker = function (inputElement) {
  // Check
  if (!isRealValue(inputElement)) {
    throw Error('colorPicker.js: Expected input argument, but received none.')
  }

  // Construct
  const picker = new CP(inputElement)
  picker.on('change', function (r, g, b, a) {
    try {
      this.source.value = this.color(r, g, b, a)
      this.source.innerHTML = this.color(r, g, b, a)
      this.source.style.backgroundColor = this.color(r, g, b, a)
    }
    catch (err) {
      console.error('Caught!', err.message)
    }

  })

  return picker
}

function clearClassList (element) {
  const classList = element.classList
  while (classList.length > 0) {
    classList.remove(classList.item(0))
  }
}

function toggleButtonHighlight (btn) {
  const isOn = btn.classList.contains('btnOn')
  clearClassList(btn)
  if (isOn) {
    btn.classList.add('btn')
  } else {
    btn.classList.add('btnOn')
  }
}

function buttonIsOn (btn) {
  return btn.classList.contains('btnOn')
}

function isRealValue (obj) {
  return obj && obj !== 'null' && obj !== 'undefined'
}

const isEmpty = function (value) {
  const isEmptyObject = function (a) {
    if (typeof a.length === 'undefined') { // it's an Object, not an Array
      const hasNonempty = Object.keys(a).some(function nonEmpty (element) {
        return !isEmpty(a[element])
      })
      return hasNonempty ? false : isEmptyObject(Object.keys(a))
    }

    return !a.some(function nonEmpty (element) { // check if array is really not empty as JS thinks
      return !isEmpty(element) // at least one element should be non-empty
    })
  }
  return (
    value === false || typeof value === 'undefined' || value === null || (typeof value === 'object' && isEmptyObject(value))
  )
}

function getAColorThatShowsUp (strokeColor) {
  function isBlueIsh () {
    return strokeColor.endsWith('ff')
  }

  function isCyanOrMagenta () {
    return strokeColor === '#00ffff' || strokeColor === '#ff00ff'
  }

  if (isBlueIsh() && !isCyanOrMagenta()) {
    return 'rgba(255, 255, 0, 0.5)' // yellow
  } else {
    return 'rgba(0, 0, 255, 0.5)' // blue (default)
  }
}

function alertMessage (messageObject) {
  alert(messageObject)
  return true
}

function calculateAspectRatioFit (srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  }
}

function makeId(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let i
  for (i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * pageSetup
 * Set up web page for multi-viewer.
 *
 * @param divId: Main div id.
 * @param image: Base image.
 * @param features: Array of features (feature layers).
 * @param opacity: Array of features opacities.
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; filters, paintbrush, sliders, etc.
 */
const pageSetup = function (divId, image, features, opacity, numViewers, rows, columns, width, height, opts) {
  let viewers = [] // eslint-disable-line prefer-const
  let sliderIdNum = 0

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(opts)

    }).then(function (opts) {
      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      table.id = 'myTable'
      mainDiv.appendChild(table) // TABLE ADDED TO PAGE
      let slider1, slider2

      // CREATE ROWS & COLUMNS
      let r
      const num = rows * columns
      let count = 0
      for (r = 0; r < rows; r++) {
        const tr = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          count++
          const td = tr.insertCell(c)
          const osdId = makeId(11) // DIV ID REQUIRED FOR OSD
          let f1 = makeId(5)
          let f2 = makeId(5)
          let f3 = makeId(5)
          let f4 = makeId(5)
          // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          let container = document.createElement('div') // Viewer + tools
          container.className = 'divSquare'
          container.style.width = width + 'px'
          td.appendChild(container) // ADD CONTAINER TO CELL

          // LAYERS BUTTON
          let htm = `<div><i id="colors${idx}" style="cursor: pointer;" class="fa fa-layer-group"></i></div>`

          // NAVIGATION TOOLS
          if (numViewers > 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            // SHOW / HIDE TOOLBAR
            htm += `<span class="controls" id="hideTools${idx}" style="color:blue; cursor:pointer;">[+] </span><BR>
<span id="tools${idx}" hidden=true>`

            // SLIDERS
            if (opts && opts.slidersOn) {
              slider1 = sliderIdNum += 1
              slider2 = sliderIdNum += 1

              htm += `<span class="range">
<input type="range" id="sliderRange${slider1}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
<input type="range" id="sliderRange${slider2}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
</span>`
            }

            // ANNOTATION TOOLS
            htm += `<span class="floated buttons">`

            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn"><i class="fas fa-pencil-alt"></i> Draw polygon</button>&nbsp;
<button id="btnEdit${idx}" class="btn"><i class="fas fa-draw-polygon"></i> Edit polygon</button>&nbsp;
<button id="btnGrid${idx}" class="btn"><i class="fas fa-border-all"></i> Draw grid</button>&nbsp;
<button id="btnGridMarker${idx}" class="btn"><i class="fas fa-paint-brush"></i> Mark grid</button>&nbsp;
<button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button></div>`

            // END
            htm += `</span></span>`
          }

          // DRAGGABLE LAYERS
          if (opts && opts.draggableLayers) {
            htm += `<div class="tab" id="tabBox${idx}">`

            const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm;
            try {
              if (idx === 1) {
                // TODO: This is a hack.
                htm += `<button class="tab_links" id="feat${f1}" draggable="true">${features[0][0] ? features[0][0].match(regex) : 'Feat n'}</button>
            <button class="tab_links" id="feat${f2}" draggable="true">${features[1][0] ? features[1][0].match(regex) : 'Feat n'}</button>`
              } else {
                htm += `<button class="tab_links" id="feat${f3}" draggable="true">${features[0][0] ? features[0][0].match(regex) : 'Feat n'}</button>
            <button class="tab_links" id="feat${f4}" draggable="true">${features[1][0] ? features[1][0].match(regex) : 'Feat n'}</button>`
              }
            }
            catch(err) {
              console.error(err.message)
            }

            htm += `&nbsp;</div>`
          }

          // CREATE VIEWER
          htm += `<div id="${osdId}" class="viewer" style="width: ${width}px; height: ${height}px;"></div>`

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // EVENT HANDLER - Show / Hide
          if (opts && opts.toolbarOn) {
            let toggle = document.getElementById('hideTools' + idx)
            let tools = document.getElementById('tools' + idx)
            toggle.addEventListener('click', function () {
              if (tools.hidden) {
                tools.hidden = false
                this.textContent = '[-] '
                this.style.color = "maroon"
              } else {
                tools.hidden = true
                this.textContent = '[+] '
                this.style.color = "blue"
              }
            })

            // ADD FUNCTIONALITY - colorPicker
            colorPicker(document.getElementById('mark' + idx))
          }

          // NEED TO PASS THESE TO VIEWER
          let sliderElements = []
          try {
            sliderElements.push(document.getElementById('sliderRange' + slider1))
            sliderElements.push(document.getElementById('sliderRange' + slider2))
          } catch (e) {
            console.log(e)
          }

          // ADD A MultiViewer OBJECT TO ARRAY
          viewers.push(new MultiViewer(idx, osdId, image, features, opacity, sliderElements, numViewers, opts))

          if (numViewers < num && (count - 1 === numViewers)) {
            // we've done our last viewer
            break
          }
        }
      }

      return viewers
    }).then(function (viewers) {
      // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
      synchronizeViewers(viewers)
    })
  })
}

const editPolygon = function (idx, overlay) {
  document.getElementById('btnEdit' + idx).addEventListener('click', function () {
    toggleButtonHighlight(this)
    Edit(overlay.fabricCanvas())
  })
}

// Position handling code borrowed from: http://fabricjs.com/custom-controls-polygon
function polygonPositionHandler (dim, finalMatrix, fabricObject) {
  // This function looks at the pointIndex of the control and returns the
  // current canvas position for that particular point.
  const x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x)
  const y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y)

  return fabric.util.transformPoint(
    { x: x, y: y },

    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix()
    )
  )
}

// Custom action handler makes the control change the current point.
function actionHandler (eventData, transform, x, y) {
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
function anchorWrapper (anchorIndex, fn) {
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

function getPolygon (canvas) {
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

function Edit (canvas) {
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
    alertMessage('Please select a polygon for editing.')
  }
}

/**
 * Allow user to draw a polygon on the image.
 *
 * @param idx: Current viewer index.
 * @param viewer: OSD viewer object.
 * @param overlay: fabric overlay object.
 */
const drawPolygon = function (idx, viewer, overlay) {
  const btnDraw = document.getElementById('btnDraw' + idx)
  const mark = document.getElementById('mark' + idx)

  const canvas = overlay.fabricCanvas()

  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
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
    toggleButtonHighlight(this)

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

  clearClassList(button)

  button.classList.add('btn')

  canvas.off('path:created', function () {
    pathCreatedHandler(options, button, canvas, paintBrush, viewer)
  })
}

function setGestureSettings (canvas, viewer) {
  if (!canvas.getActiveObject()) {
    $('.deleteBtn').remove()
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
    jQuery('.deleteBtn').remove()
    const btnLeft = x - 10
    const btnTop = y - 10
    const deleteBtn = `<img src="images/delete-icon.png" class="deleteBtn" style="position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;"/>`
    jQuery('.canvas-container').append(deleteBtn)
  }

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

  jQuery('.canvas-container').on('click', '.deleteBtn', function () {
    viewer.gestureSettingsMouse.clickToZoom = false
    if (canvas.getActiveObject()) {
      canvas.remove(canvas.getActiveObject())
      jQuery('.deleteBtn').remove()
    }
    viewer.gestureSettingsMouse.clickToZoom = true
  })
}

function convertPathToPolygon (pathObject, canvas, paintBrush) {
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

/**
 * mugshots.js
 * Create an array of rois; onClick: image will zoom to area, and draw a box around the ROI.
 *
 * @param options:
  {
    'divId': options.divId,
    'thumbId': options.thumbId,
    'infoUrl': options.infoUrl,
    'imgDims': options.imgDims,
    'thumbnailSize': options.thumbnailSize,
    'scrollerLength': options.scrollerLength,
    'mugshotArray': options.mugshotArray,
    'roiColor': options.roiColor,
    'overlay': options.overlay,
    'viewer': options.viewer
  }
 */
const mugshots = function (options) {
  const canvas = this.__canvas = options.overlay.fabricCanvas()
  options.overlay.resizeCanvas = function () {
    // Function override: Resize overlay canvas
    const image1 = this._viewer.world.getItemAt(0)

    this._fabricCanvas.setWidth(this._containerWidth)
    this._fabricCanvas.setHeight(this._containerHeight)
    this._fabricCanvas.setZoom(image1.viewportToImageZoom(this._viewer.viewport.getZoom(true)))

    const image1WindowPoint = image1.imageToWindowCoordinates(new OpenSeadragon.Point(0, 0))
    const canvasOffset = this._canvasdiv.getBoundingClientRect()
    const pageScroll = OpenSeadragon.getPageScroll()

    this._fabricCanvas.absolutePan(new fabric.Point(canvasOffset.left - Math.round(image1WindowPoint.x) + pageScroll.x, canvasOffset.top - Math.round(image1WindowPoint.y) + pageScroll.y))
  }

  const vpt = options.viewer.viewport

  const size = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  createScroller(options.imgDims)

  function createScroller (data) {
    let ul, li, span

    const fragment = document.createDocumentFragment()
    ul = document.createElement('ul')
    ul.classList.add('thumbnail-list')
    fragment.appendChild(ul)

    let j
    for (j = 0; j < options.scrollerLength; j++) {
      li = document.createElement('li')
      ul.appendChild(li)
      span = document.createElement('span')
      // Giving it some number in the middle of the image
      // createThumbnail(data, span, Math.round(data.width / 2), Math.round(data.height / 2)) // Image coordinates
      createThumbnail(data, span)
      li.appendChild(span)
    }
    document.getElementById(options.thumbId).appendChild(fragment)
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function xyExist (x, y) {
    return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
  }

  function createThumbnail (data, span, x, y) {
    let imageRect // it's a rectangle
    if (xyExist(x, y)) {
      // x,y,w,h
      imageRect = new OpenSeadragon.Rect(x, y, options.thumbnailSize, options.thumbnailSize)
    } else {
      imageRect = randomImageRectangle(data)
    }
    checkWholeNumbers(imageRect)

    const imgElement = document.createElement('IMG')
    imgElement.alt = 'mugshot'
    imgElement.classList.add('thumbnail-image')

    imgElement.src = getImageUrl(options.infoUrl, imageRect)

    span.appendChild(imgElement)

    // highlightLocation(imageRect)

    imgElement.addEventListener('click', function () {
      showThumbnailOnImage(imageRect)
    })
  }

  function checkWholeNumbers (imageRect) {
    // IIIF wants whole numbers
    const imagePoint = imageRect.getTopLeft()
    if (imagePoint.x % 1 !== 0) {
      console.warn(imagePoint.x, 'not a whole number')
    }
    if (imagePoint.y % 1 !== 0) {
      console.warn(imagePoint.y, 'not a whole number')
    }
  }

  function getImageUrl (infoUrl, imageRect) {
    return infoUrl + '/' +
      imageRect.getTopLeft().x + ',' +
      imageRect.getTopLeft().y + ',' +
      imageRect.width + ',' +
      imageRect.height + '/' +
      size + '/' +
      rotation + '/' +
      quality + '.' + format
  }

  function showThumbnailOnImage (imageRect) {
    zoomToLocation(imageRect)
    highlightLocation(imageRect)
  }

  function zoomToLocation (imageRect) {
    const vptRect = vpt.imageToViewportRectangle(imageRect)
    vpt.panTo(vptRect.getCenter())
    vpt.zoomTo(vpt.getMaxZoom())
  }

  function highlightLocation (imageRect) {
    // Translate coordinates => image to viewport coordinates.
    // const vptRect = vpt.imageToViewportRectangle(imageRect)
    // const webRect = vpt.viewportToViewerElementRectangle(vptRect)
    // canvas.add(
    //   new fabric.Rect({
    //     stroke: options.roiColor,
    //     strokeWidth: 1,
    //     fill: '',
    //     left: webRect.x,
    //     top: webRect.y,
    //     width: webRect.width,
    //     height: webRect.height
    //   })
    // )

    // TODO: NOTE: With resizeCanvas override, use imageRect
    canvas.add(
      new fabric.Rect({
        stroke: options.roiColor,
        strokeWidth: 2,
        fill: '',
        left: imageRect.x,
        top: imageRect.y,
        width: imageRect.width,
        height: imageRect.height
      })
    )

    canvas.renderAll()
  }

  function randomImageRectangle (data) {
    // Give it plenty of room from the edge
    const padding = options.thumbnailSize * 2 // 512
    const left = getRandomInt(padding, (data.width - padding))
    const top = getRandomInt(padding, (data.height - padding))

    return new OpenSeadragon.Rect(left, top, options.thumbnailSize, options.thumbnailSize)
  }
}

const gridOverlay = function (idx, overlay) {
  const cellSize = 25

  const gridProps = {
    canvas: overlay.fabricCanvas(),
    canvasWidth: Math.ceil(overlay.fabricCanvas().width),
    canvasHeight: Math.ceil(overlay.fabricCanvas().height),
    cellWidth: cellSize,
    cellHeight: cellSize,
    color: '#C0C0C0',
    cellX: [],
    cellY: [],
    gridAdded: false
  }

  const btnGrid = document.getElementById('btnGrid' + idx)
  btnGrid.addEventListener('click', function () {
    gridHandler(this, gridProps)
  })

  const btnGridMarker = document.getElementById('btnGridMarker' + idx)
  btnGridMarker.addEventListener('click', function () {
    markerHandler(this, gridProps)
  })
}

function gridHandler (button, gridProps) {
  toggleButtonHighlight(button)

  if (buttonIsOn(button)) {
    turnGridOn(gridProps)
    gridProps.gridAdded = true
    button.innerHTML = '<i class="fas fa-border-all"></i> Remove grid'
  }

  if (!buttonIsOn(button)) {
    turnGridOff(gridProps)
    gridProps.gridAdded = false
    button.innerHTML = '<i class="fas fa-border-all"></i> Draw grid'
  }
}

function turnGridOff (gridProps) {
  const r = gridProps.canvas.getObjects('line')
  let i
  for (i = 0; i < r.length; i++) {
    gridProps.canvas.remove(r[i])
  }
}

function turnGridOn (gridProps) {
  const lineProps = { stroke: gridProps.color, strokeWidth: 2, selectable: false }

  createHorizontalLines(gridProps, lineProps)
  createVerticalLines(gridProps, lineProps)

  gridProps.canvas.renderAll()
  gridProps.gridAdded = true
}

function createHorizontalLines (gridProps, lineProps) {
  let y
  for (y = 0; y < Math.ceil(gridProps.canvasHeight / gridProps.cellHeight); ++y) {
    gridProps.canvas.add(new fabric.Line([0, y * gridProps.cellHeight, gridProps.canvasWidth, y * gridProps.cellHeight], lineProps))
    gridProps.cellY[y + 1] = y * gridProps.cellHeight // and keep track of the y cells
  }
}

function createVerticalLines (gridProps, lineProps) {
  let x
  for (x = 0; x < Math.ceil(gridProps.canvasWidth / gridProps.cellWidth); ++x) {
    gridProps.canvas.add(new fabric.Line([x * gridProps.cellWidth, 0, x * gridProps.cellWidth, gridProps.canvasHeight], lineProps))
    gridProps.cellX[x + 1] = x * gridProps.cellWidth // and keep track of the x cells
  }
}

function fillInGrid (pointerEvent, gridProps) {
  const mousePosition = getMousePosition(pointerEvent, gridProps)
  const cellPosition = getCellPosition(mousePosition)

  const rect = new fabric.Rect({
    left: gridProps.cellX[cellPosition.x],
    top: gridProps.cellY[cellPosition.y],
    fill: 'red',
    width: gridProps.cellWidth,
    height: gridProps.cellHeight,
    opacity: 0.5,
    selectable: false
  })
  gridProps.canvas.add(rect)
}

function getMousePosition (pointerEvent, gridProps) {
  const pointer = gridProps.canvas.getPointer(pointerEvent.e)
  const positionX = pointer.x / gridProps.cellWidth
  const positionY = pointer.y / gridProps.cellHeight
  return { x: positionX, y: positionY }
}

function getCellPosition (mousePosition) {
  const positionX = Math.ceil(mousePosition.x + 0.001)
  const positionY = Math.ceil(mousePosition.y + 0.001)
  return { x: positionX, y: positionY }
}

function markerHandler (button, gridProps) {
  toggleButtonHighlight(button)
  const on = buttonIsOn(button)

  if (!on) {
    // Done marking; remove mouse:move listener because we use it for other things.
    gridProps.canvas.__eventListeners['mouse:move'] = []
    button.innerHTML = '<i class="fas fa-paint-brush"></i> Mark grid'
  }

  if (on) {
    if (gridProps.gridAdded) {
      gridProps.canvas.on('mouse:move', function (pointerEvent) {
        fillInGrid(pointerEvent, gridProps)
      })
      button.innerHTML = '<i class="fas fa-paint-brush"></i> Done marking'
    } else {
      toggleButtonHighlight(button) // turn it back off; we're not letting them do this
      alertMessage('Please draw a grid first.')
    }
  }
}

// On right-click in viewer, add map marker to the other viewers
const mapMarker = function (currentOSDViewer, syncedNViewers) {
  overrideRightClickMenu(currentOSDViewer.element)

  handleMarkerDisplay(currentOSDViewer, syncedNViewers)

  handleButtonShowHide()
}

function overrideRightClickMenu (viewerDiv) {
  viewerDiv.addEventListener('contextmenu', function (mouseEvent) {
    mouseEvent.preventDefault()
  })
}

function handleMarkerDisplay (currentOSDViewer, syncedNViewers) {
  currentOSDViewer.addHandler('canvas-nonprimary-press', function (osdEvent) {
    if (isRightClick(osdEvent)) {
      const clickPosition = osdEvent.position
      const clickPositionViewport = currentOSDViewer.viewport.pointFromPixel(clickPosition)

      const buttons = document.querySelectorAll('#btnMapMarker')
      buttons.forEach(function (item) {
        item.style.display = 'block'
      })
      displayMapMarker(clickPositionViewport, currentOSDViewer, syncedNViewers)
    }
  })
}

function isRightClick (evt) {
  return (evt.button === 2)
}

function displayMapMarker (point, currentOSDViewer, syncedNViewers) {
  syncedNViewers.forEach(function (item) {
    const viewer = item.getViewer()
    if (viewer.id === currentOSDViewer.id) {
      return
    }
    addMarkerToViewer(point, viewer)
  })
}

function addMarkerToViewer (point, viewer) {
  const link = createLink()
  viewer.addOverlay({
    element: link,
    location: point,
    placement: 'BOTTOM',
    checkResize: false
  })
}

function createLink () {
  const link = document.createElement('a')
  const href = '#'
  link.href = href
  link.dataset.href = href
  link.id = 'the-map-marker'
  link.className = 'fas fa-map-marker'
  link.style.cssText =
    ' text-decoration: none; font-size: 22px; color: red;' +
    ' cursor: pointer'
  return link
}

function handleButtonShowHide () {
  const buttons = document.querySelectorAll('#btnMapMarker')
  buttons.forEach(function (elem) {
    let markersHaveBeenDrawn = false
    let style, html
    elem.addEventListener('click', function () {
      if (markersHaveBeenDrawn) {
        style = 'block'
        html = '<i class="fas fa-map-marker"></i> Hide markers'
      } else {
        style = 'none'
        html = '<i class="fas fa-map-marker"></i> Show markers'
      }
      this.innerHTML = html
      document.querySelectorAll('#the-map-marker').forEach(function (thing) {
        thing.style.display = style
      })
      markersHaveBeenDrawn = !markersHaveBeenDrawn
    })
  })
}

const markupTools = function (idx, viewer) {
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  drawPolygon(idx, viewer, overlay)
  editPolygon(idx, overlay)
  gridOverlay(idx, overlay)
  // ruler(idx, viewer, overlay)
}

let imageFiltering = function() {
  'use strict'
  let colors = []
  _setColors()
  let colorRanges = [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]
  let layerNumber = 1

  function _setColors() {
    // My RGB object
    function filterColors(r, g, b) {
      this.r = r
      this.g = g
      this.b = b
    }

    // Colors per layer
    colors.push(new filterColors(0, 255, 0)) // we skip the first layer, so colors[0] doesn't count
    colors.push(new filterColors(0, 255, 0)) // lime 00ff00
    colors.push(new filterColors(255, 255, 0)) // yellow ffff00
    colors.push(new filterColors(0, 255, 255)) // cyan 00ffff
    colors.push(new filterColors(255, 0, 0)) // red ff0000
    colors.push(new filterColors(255, 165, 0)) // orange ffa500
    colors.push(new filterColors(0, 128, 0)) // dark green 008000
    colors.push(new filterColors(0, 0, 255)) // blue 0000ff
    colors.push(new filterColors(75, 0, 130)) // indigo 4b0082
    colors.push(new filterColors(28, 28, 28)) // dark gray #1c1c1c
    colors.push(new filterColors(167, 226, 46)) // leaf green #a7e22e
    colors.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
    colors.push(new filterColors(255, 210, 4)) // goldenrod #ffd204
  }

  function sortIt(cr) {
    // sort by low, desc
    cr.sort(function (c1, c2) {
      if (c1.low > c2.low) return -1
      if (c1.low < c2.low) return 1
    })
  }

  // Function to help drag popup around screen
  function dragElement(elmnt) {
    let pos1 = 0
    let pos2 = 0
    let pos3 = 0
    let pos4 = 0

    let header = document.getElementsByClassName('popupHeader')
    if (header) {
      // if present, the header is where you move the DIV from:
      let n
      for (n = 0; n < header.length; n++) {
        header[n].onmousedown = dragMouseDown
      }
    }

    // Mousedown handler
    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag
    }

    // Mouse-move handler
    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
      elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
    }

    // Done handler
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  function setViewerFilter(viewer) {
    try {
      viewer.setFilterOptions({
        filters: [{
          items: viewer.world.getItemAt(layerNumber === 0 ? 1 : layerNumber),
          processors: [
            getFilter1().prototype.COLORLEVELS(colorRanges)
          ]
        }]
      })
    } catch (err) {
      console.log('OK')
    }
  }

  // NUMBER INPUT to let user set threshold values
  function createNumericInput({id, val, index}, viewer) {
    let x = document.createElement('input')
    x.id = id
    x.setAttribute('type', 'number')
    x.min = '0'
    x.max = '255'
    x.step = '1'
    x.value = val.toString()
    x.size = 5

    // this event happens whenever the value changes
    x.addEventListener('input', function () {
      let intVal = parseInt(this.value)

      // If they set it to something outside of 0-255, reset it
      if (intVal > 255) this.value = '255'
      if (intVal < 0) this.value = '0'

      if (this.id.startsWith('low')) {
        colorRanges[index].low = parseInt(this.value)
      } else {
        colorRanges[index].hi = parseInt(this.value)
        setViewerFilter(viewer) // triggered by high value input
      }
    })

    return x
  }

  function layerButtonToggle(color, cursor) {
    jQuery("*").each(function () {
      if (this.id.startsWith('osd-overlaycanvas')) {
        let num = this.id.slice(-1) // hack to get the id #
        let z = document.getElementById(`colors${num}`)
        z.style.color = color
        z.style.cursor = cursor
      }
    })
  }

  function rgba2hex(orig) {
    let a
    const rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
    const alpha = (rgb && rgb[4] || '').trim()
    let hex = rgb
      ? (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig

    if (alpha !== '') {
      a = alpha
    } else {
      a = 0o1
    }
    // multiply before convert to HEX (a * 255)
    a = (a | 1 << 8).toString(16).slice(1)
    hex = hex + a
    hex = `#${hex}`

    return hex
  }

  function colorPickerEvent(mark, idx, viewer) {
    const cp = new CP(mark)

    cp.on('change', (r, g, b, a) => {
      try {
        cp.source.value = cp.color(r, g, b, a)
        cp.source.innerHTML = cp.color(r, g, b, a)
        cp.source.style.backgroundColor = cp.color(r, g, b, a)
        colorRanges[idx].color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
        setViewerFilter(viewer)
      } catch (err) {
        console.warn('check this:', err.message)
      }
    })
  }

  // CREATE USER INPUT PER COLOR
  // Display colors and low/high values
  // {color: "rgba(r, g, b, a)", hi: n, low: n}
  function createUserInput(colorPopup, viewer) {
    let i
    for (i = 0; i < colorRanges.length; i++) {
      // COLOR DIV
      let colorDiv = document.createElement('div')
      let colorCode = colorRanges[i].color

      // COLOR PICKER
      let m = document.createElement('mark')
      m.id = `marker${i}`
      m.innerHTML = rgba2hex(colorCode)
      colorDiv.appendChild(m)
      colorPickerEvent(m, i, viewer)

      // LOW
      let lowDiv = document.createElement('div')
      let d = {
        id: `low${i}`,
        val: colorRanges[i].low,
        index: i
      }
      lowDiv.appendChild(createNumericInput(d, viewer))

      // HIGH
      let hiDiv = document.createElement('div')
      d = {
        id: `hi${i}`,
        val: colorRanges[i].hi,
        index: i
      }
      hiDiv.appendChild(createNumericInput(d, viewer))

      // ADD TO CONTAINER DIV
      colorPopup.appendChild(colorDiv)
      colorPopup.appendChild(lowDiv)
      colorPopup.appendChild(hiDiv)
    }
  }

  function createPopup({clientX, clientY}, {style}, viewer) {
    // Disable buttons
    layerButtonToggle('#ccc', 'not-allowed')

    // Highlight this button
    style.color = '#0f0'
    style.cursor = 'pointer'

    // Main container
    let colorPopup = document.createElement('div')
    colorPopup.id = 'colorPopup'
    colorPopup.classList.add('grid-container')
    colorPopup.classList.add('colorPopup')

    // Close button
    let d = document.createElement('div')
    d.className = 'popupHeader'
    const img = document.createElement('img')
    img.src = 'images/close_icon.png'
    img.width = 25
    img.height = 25
    img.style.cssFloat = 'left'
    d.appendChild(img)

    // Remove div on click
    img.addEventListener('click', function () {
      style.color = '#000'
      // Re-enable buttons
      layerButtonToggle('#000', 'pointer')
      this.parentNode.parentNode.remove()
    })
    colorPopup.appendChild(d)

    // Header to drag around screen
    const popupHeader = document.createElement('div')
    popupHeader.className = 'popupHeader'
    popupHeader.innerHTML = 'Color Levels'
    colorPopup.appendChild(popupHeader)
    let t = document.createElement('div')
    t.className = 'popupHeader'
    colorPopup.appendChild(t)

    // Sort
    sortIt(colorRanges)

    // UI
    createUserInput(colorPopup, viewer)

    // put it where user clicked
    colorPopup.style.left = `${clientX}px`
    colorPopup.style.top = `${clientY}px`

    document.body.appendChild(colorPopup)

    // Make DIV element draggable:
    dragElement(colorPopup)
  }

  function handleColorLevels(layersBtn, viewer) {
    // Event handler for the layers button
    layersBtn.addEventListener('click', event => {
      event = event || window.event

      // Let there be only one
      let el = document.getElementById('colorPopup')
      if (!el) {
        createPopup(event, layersBtn, viewer)
      }
    })
  }

  let getFilter = function () {
    let filter = OpenSeadragon.Filters.GREYSCALE
    filter.prototype.COLORIZE = ({r, g, b}) => (context, callback) => {
      // w x h: 256 x 256
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        // Read the canvas pixels
        let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        if (typeof imgData !== undefined) {
          try {
            const pixels = imgData.data
            // Run the filter on them
            let i
            for (i = 0; i < pixels.length; i += 4) {
              if (pixels[i + 3] === 255) {
                // Alpha channel = 255 ("opaque"): nuclear material here.
                pixels[i] = r
                pixels[i + 1] = g
                pixels[i + 2] = b
                pixels[i + 3] = 255
              } else {
                // No nuclear material: set to transparent.
                pixels[i + 3] = 0
              }
            }
          } catch (err) {
            console.warn('1:', err.message)
          }

          try {
            // Write the result back onto the canvas
            context.putImageData(imgData, 0, 0)
            callback()
          } catch (err) {
            console.warn('2:', err.message)
          }
        } else {
          console.warn('imgData undefined')
        }
      } else {
        filter = null
        console.warn('Canvas width and height are 0. Setting filter to null')
      }
    }
    return filter
  }

  let getFilter1 = function () {
    // colorRanges array = [{color: "rgba(r, g, b, a)", low: n, hi: n}, {...}, etc]
    let filter1 = OpenSeadragon.Filters.GREYSCALE
    filter1.prototype.COLORLEVELS = colorRanges => (context, callback) => {
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        // Read the canvas pixels
        let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        if (typeof imgData !== undefined) {
          try {
            const pxl = imgData.data
            let j
            for (j = 0; j < pxl.length; j += 4) {
              if (pxl[j + 3] === 255) {
                let rgba = levels(pxl[j], colorRanges) // r = g = b
                if (typeof rgba === 'undefined') {
                  console.warn('rgba undefined', pxl[j])
                }
                pxl[j] = rgba[0]
                pxl[j + 1] = rgba[1]
                pxl[j + 2] = rgba[2]
                pxl[j + 3] = rgba[3]
              } else {
                // No nuclear material: set to transparent.
                pxl[j + 3] = 0
              }
            }
          } catch (err) {
            console.warn('1:', err.message)
          }

          function levels(value, _colors) {
            try {
              let i
              let retVal
              for (i = 0; i < _colors.length; i++) {
                let low = _colors[i].low
                let hi = _colors[i].hi
                let color = _colors[i].color
                if (value >= low && value <= hi) {
                  retVal = parseColor(color)
                }
              }

              if (typeof retVal === 'undefined') {
                return value
              } else {
                return retVal
              }
            } catch (err) {
              console.warn('2:', err.message)
            }
          }

          function parseColor(input) {
            // Input: rgba(r, g, b, a) => Output: [r, g, b, a]
            return input.replace(/[a-z%\s\(\)]/g, '').split(',')
          }

          try {
            context.putImageData(imgData, 0, 0)
            callback()
          } catch (err) {
            console.warn('3:', err.message)
          }

        } else {
          console.warn('imgData undefined')
        }
      } else {
        filter1 = null
        console.warn('Canvas width and height are 0. Setting filter to null')
      }
    }
    return filter1
  }
  return {
    getFilter: getFilter,
    getFilter1: getFilter1,
    handleColorLevels: handleColorLevels,

    getColors() {
      // Return color array defined at top of script
      return colors
    },

    getColor(num) {
      // Get color per layer num
      if (num >= colors.length) {
        // random 0 - N
        return colors[Math.floor(Math.random() * colors.length - 1)]
      } else {
        return colors[num]
      }
    },

    getColorRanges() {
      return colorRanges
    },

    setColorRanges(cr) {
      /* USER DEFINES WHICH COLORS GO WITH WHAT NUMERIC RANGES OF PIXEL VALUES */
      colorRanges = cr
    },

    getLayerNumber() {
      return layerNumber
    },

    setLayerNumber(num) {
      /* PGM SETS CURRENT LAYER */
      layerNumber = num
    }
  }
}

/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 * @param opacity - feature opacity
 */
class ImageViewer {

  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, options) {
    this.viewer = {}
    this.options = options
    this.imf = filters()
    this.setSources(viewerIndex, baseImage, featureLayers, opacity, this.setViewer(viewerDivId), this.imf, this.options)
  }

  setViewer(viewerDivId) {
    let viewer
    try {
      viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous'
      })
    } catch (e) {
      console.warn('setViewer', e)
      viewer = null
    }
    this.viewer = viewer
    return viewer

  }

  getViewer() {
    return this.viewer
  }

  getImF() {
    // Image Filter
    return this.imf
  }

  setSources(viewerIndex, baseImage, allFeatures, allOpacity, viewer, imf, options) {
    let idx = viewerIndex - 1  // Array starts with 0; viewer indices start with 1
    let opacity = allOpacity[idx]

    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      // Add FEATURE layers to viewer
      if (arrayCheck(viewerIndex, allFeatures)) {
        allFeatures[idx].forEach(function (feature, index) {
          viewer.addTiledImage({tileSource: feature, opacity: (opacity[index]).toFixed(1), x: 0, y: 0})
        })
      }

      overlayFeatures(viewer, imf, options.colorRanges)

    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

    function arrayCheck(viewerIndex, featureLayers) {
      // Do we have an array of features?
      if (typeof featureLayers === 'undefined') {
        return false
      }
      if (featureLayers.length === 0) {
        return false
      }
      // Do we have an array of features, for this viewer?
      if (typeof featureLayers[viewerIndex - 1] === 'undefined') {
        return false
      }
      if (featureLayers[viewerIndex - 1].length === 0) {
        return false
      }
      // All checks were successful
      return true
    }

    function overlayFeatures(viewer, imf, colorRanges) {

      try {
        viewer.world.addHandler('add-item', function (event) {
          let itemIndex = viewer.world.getIndexOfItem(event.item)
          // let itemCount = viewer.world.getItemCount()
          let filter = fetchFilter(imf, colorRanges)
          if (filter !== null && itemIndex > 0) {
            imf.setLayerNumber(itemIndex)
            if (colorRanges.length > 0) {
              viewer.setFilterOptions({
                filters: [{
                  items: viewer.world.getItemAt(itemIndex),
                  processors: [
                    filter.prototype.COLORLEVELS(colorRanges)
                  ]
                }]
              })
            } else {
              // Use COLORIZE
              viewer.setFilterOptions({
                filters: [{
                  items: viewer.world.getItemAt(itemIndex),
                  processors: [
                    filter.prototype.COLORIZE(imf.getColor(itemIndex))
                  ]
                }]
              })
            }
            viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
              return getIIIFTileUrl(this, level, x, y)
            }
          }
        })
      } catch (e) {
        console.error('Here we are', e.message)
      }
    }

    function fetchFilter(imf, cr) {
      // MAKE DECISION ON TYPE OF FILTER
      let ranges = cr && cr.length > 0
      let filter
      if (ranges) {
        imf.setColorRanges(cr)
        filter = imf.getFilter1()
      } else {
        filter = imf.getFilter()
      }
      return filter
    }

    function dataCheck(url, jqXHR) {
      const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
      console.warn(message)
      console.log('jqXHR object:', jqXHR)
      console.log('URL', url)
      document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
      throw new Error('Something went wrong.') // Terminates the script.
    }

    function getIIIFTileUrl(source, level, x, y) {
      const scale = Math.pow(0.5, source.maxLevel - level)
      const levelWidth = Math.ceil(source.width * scale)
      const levelHeight = Math.ceil(source.height * scale)

      const tileSize = source.getTileWidth(level) // width == height
      let tileSizeWidth
      const tileSizeHeight = tileSizeWidth = Math.ceil(tileSize / scale)

      const ROTATION = '0'
      const quality = 'default.png'

      let region, tileX, tileY, tileW, tileH, size

      if (levelWidth < tileSize && levelHeight < tileSize) {
        size = levelWidth + ','
        region = 'full'
      } else {
        tileX = x * tileSizeWidth
        tileY = y * tileSizeHeight
        tileW = Math.min(tileSizeWidth, source.width - tileX)
        tileH = Math.min(tileSizeHeight, source.height - tileY)
        size = Math.ceil(tileW * scale) + ','
        region = [tileX, tileY, tileW, tileH].join(',')
      }
      return [source['@id'], region, size, ROTATION, quality].join('/')
    }
  }

}

/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 * @param opacity - feature opacity
 * @param sliderElements: 2 slides per image viewer (controls image opacity and overlay opacity).
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, sliderElements, numViewers, options) {
    super(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    try {
      this.checkboxes = {
        checkPan: true,
        checkZoom: true
      }

      this.viewer1 = super.getViewer()
      this.idx = viewerIndex
      this.sliders = sliderElements
      this.imf = super.getImF()

      if (numViewers > 1) {
        this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
        this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
      }

      if (options.slidersOn && options.toolbarOn) {
        addInputHandler(this.sliders, this.viewer1)
      }

      if (options.toolbarOn) {
        markupTools(this.idx, this.viewer1)
      }

      if (options.draggableLayers) {
        handleDraggable()
      }

      let layersBtn = document.getElementById('colors' + this.idx)
      if (layersBtn) {
        if (options.colorRanges) {
          let x = this.imf.getColorRanges()
          if (isEmpty(x)) {
            this.imf.setColorRanges(options.colorRanges)
          }
          this.imf.handleColorLevels(layersBtn, this.viewer1)

        } else {
          console.warn("No colors, no button for you.")
          layersBtn.style.visibility = hidden
        }
      }

    } catch (e) {
      console.log(e)
    }

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

// DRAGGABLE LAYER TABS
function handleDraggable() {
  let items = document.querySelectorAll('.tab_links')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    // item.addEventListener('click', handleDragStart) // will this fix it?
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  items = document.querySelectorAll('.tab')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }
    return false
  }

  function handleDragEnter(e) {
    this.classList.add('over')
  }

  function handleDragLeave(e) {
    this.classList.remove('over')
  }

  function handleDragStart(e) {
    this.style.opacity = '0.4'
    dragSrcEl = this // The draggable feature
    sourceViewer = whichViewer(dragSrcEl.parentElement.parentElement)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text', e.target.id)
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  function handleDrop(e) {
    e.stopPropagation()
    if (dragSrcEl !== this) {
      // get the element that was dragged
      let movedTab = e.dataTransfer.getData('text')
      // get the (new) parent element
      let parent = e.target.parentElement
      // Only drop to specific elements
      if (parent.classList.contains('divSquare')) {
        e.target.appendChild(document.getElementById(movedTab))
        // TODO: Keep track of which tab belongs to what layer number.
        let layer
        let targetViewer = whichViewer(parent)
        layer = targetViewer.world.getItemCount() - 1 // get the last layer (TODO: change)
        targetViewer.world.getItemAt(layer).setOpacity(1.0)
        layer = sourceViewer.world.getItemCount() - 1 // get the last layer
        sourceViewer.world.getItemAt(layer).setOpacity(0.0)
      }
    }
    return false
  }
}

function whichViewer(element) {
  let children = element.children
  let retVal, i, j
  for (i = 0; i < children.length; i++) {
    let el = children[i]
    if (el.classList.contains('viewer')) {
      try {
        // It's this viewer. Retrieve the viewer object.
        // syncedImageViewers = global variable set in synchronizeViewers.js
        for (j = 0; j < syncedImageViewers.length; j++) {
          if (syncedImageViewers[j].getViewer().id === el.id) {
            retVal = syncedImageViewers[j].getViewer()
            break
          }
        }
      } catch (e) {
        console.warn('No syncedImageViewers')
      }
    }
  }
  return retVal
}

function addInputHandler(sliderElem, viewerElem) {
  // 2 x numViewers = total number of sliders
  let i
  for (i = 0; i < sliderElem.length; i++) {
    // SLIDER EVENT LISTENER
    sliderElem[i].addEventListener('input', function () {
      let layerNum
      const num = this.id.replace('sliderRange', '') - 1  // sliderRange1, sliderRange2, ...
      if (num % 2 === 0) { // They're paired.
        layerNum = 0 // 1st slider affects the base layer
      } else {
        layerNum = 1 // 2nd slider affects the first layer
      }
      const worldItem = viewerElem.world.getItemAt(layerNum)
      if (worldItem !== undefined) {
        worldItem.setOpacity(this.value / 100) // SET OPACITY
      } else {
        // In case of 2 sliders with only 1 layer - hide the slide.
        this.hidden = true
      }
    })
  }
}

// Synchronize pan & zoom
const synchronizeViewers = function (imageViewerArray) {
  const isGood = checkData(imageViewerArray)

  if (isGood) {
    this.syncedImageViewers = []
    this.activeViewerId = null
    this.numViewers = imageViewerArray.length

    imageViewerArray.forEach(function (imageViewer) {
      const currentViewer = imageViewer.getViewer()

      setPanZoomCurrent(currentViewer, handler)

      // set this up while we're here
      mapMarker(currentViewer, this.syncedImageViewers)

      function handler () {
        if (!isActive(currentViewer.id)) {
          return
        }

        setPanZoomOthers(imageViewer)

        resetFlag()
      }

      this.syncedImageViewers.push(imageViewer)
    })
  }
}

function setPanZoomCurrent (currentViewer, handler) {
  currentViewer.addHandler('pan', handler)
  currentViewer.addHandler('zoom', handler)
}

function isActive (currentId) {
  init(currentId)
  return currentId === this.activeViewerId
}

function init (currentId) {
  if (!isRealValue(this.activeViewerId)) {
    this.activeViewerId = currentId
  }
}

function isPanOn (imageViewer) {
  const checkboxes = imageViewer.getPanZoom()

  if (typeof checkboxes.checkPan.checked !== 'undefined') {
    return checkboxes.checkPan.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return this.numViewers !== 1
  }
}

function isZoomOn (imageViewer) {
  const checkboxes = imageViewer.getPanZoom()

  if (typeof checkboxes.checkZoom.checked !== 'undefined') {
    return checkboxes.checkZoom.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return this.numViewers !== 1
  }
}

function setPanZoomOthers (imageViewer) {
  const currentViewer = imageViewer.getViewer()

  this.syncedImageViewers.forEach(function (syncedObject) {
    const syncedViewer = syncedObject.getViewer()

    if (syncedViewer.id === currentViewer.id) {
      return
    }

    if (isPanOn(syncedObject) && isPanOn(imageViewer)) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter(false), false)
    }

    if (isZoomOn(syncedObject) && isZoomOn(imageViewer)) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom(false))
    }
  })
}

function resetFlag () {
  this.activeViewerId = null
}

function checkData (imageViewerArray) {
  if (isEmpty(imageViewerArray)) {
    console.error('synchronizeViewers.js: Expected input argument, but received none.')
    return false
  }

  if (!(imageViewerArray[0] instanceof Object)) {
    console.error('synchronizeViewers.js: Array elements should be MultiViewer objects.')
    return false
  }

  return true
}
