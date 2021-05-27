/*! multi-viewer - v2.4.8 - 2021-05-27 */
function clearClassList(element) {
  const classList = element.classList
  while (classList.length > 0) {
    classList.remove(classList.item(0))
  }
}

function toggleButton(elem, onClass, offClass) {

  if (elem.classList.contains(onClass)) {
    elem.classList.remove(onClass)
    elem.classList.add(offClass)
  } else {
    elem.classList.remove(offClass)
    elem.classList.add(onClass)
  }

}

function isRealValue(obj) {
  return obj && obj !== 'null' && obj !== 'undefined'
}

const isEmpty = function (value) {
  const isEmptyObject = function (a) {
    if (typeof a.length === 'undefined') { // it's an Object, not an Array
      const hasNonempty = Object.keys(a).some(function nonEmpty(element) {
        return !isEmpty(a[element])
      })
      return hasNonempty ? false : isEmptyObject(Object.keys(a))
    }

    return !a.some(function nonEmpty(element) { // check if array is really not empty as JS thinks
      return !isEmpty(element) // at least one element should be non-empty
    })
  }
  return (
    value === false || typeof value === 'undefined' || value === null || (typeof value === 'object' && isEmptyObject(value))
  )
}

function getAColorThatShowsUp(strokeColor) {
  function isBlueIsh() {
    return strokeColor.endsWith('ff')
  }

  function isCyanOrMagenta() {
    return strokeColor === '#00ffff' || strokeColor === '#ff00ff'
  }

  if (isBlueIsh() && !isCyanOrMagenta()) {
    return 'rgba(255, 255, 0, 0.5)' // yellow
  } else {
    return 'rgba(0, 0, 255, 0.5)' // blue (default)
  }
}

function alertMessage(messageObject) {
  alert(messageObject)
  return true
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  }
}

function makeId(length, prefix) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let i
  for (i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  if (prefix) {
    result = prefix + result
  }
  return result
}

// Standard replacement for Java's String.hashCode()
String.prototype.hashCode = function () {
  let hash = 0
  if (this.length === 0) return hash
  let i, char;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

function getStringRep(_input) {
  let _md5 = _input.hashCode()
  if (_md5 < 0) {
    _md5 *= -1
  }
  let _text = _md5.toString(16)
  return _text.toUpperCase()
}

// async function
async function fetchAsync (url) {
  const response = await fetch(url) // await response of fetch call
  const data = await response.json() // only proceed once promise is resolved
  return data // only proceed once second promise is resolved
}

/**
 * pageSetup
 * Set up web page for multi-viewer.
 *
 * @param divId: Main div id.
 * @param image: Base image.
 * @param data: Array of features and opacities.
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; filters, paintbrush, sliders, etc.
 */
const pageSetup = function (divId, image, data, numViewers, rows, columns, width, height, opts) {
  let viewers = [] // eslint-disable-line prefer-const
  let sliderIdNum = 0

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(opts)

    }).then(function (opts) {
      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      // table.style.border = '1px solid black'
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
          const td = tr.insertCell(c)
          const osdId = makeId(11) // DIV ID REQUIRED FOR OSD
          // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          count++
          let container = document.createElement('div') // Viewer + tools
          container.className = 'divSquare'
          container.style.width = width + 'px'
          td.appendChild(container) // ADD CONTAINER TO CELL

          let htm = ''

          // LAYER BUTTONS
          let layerHtm = `<div>
<i id="layers${idx}" style="cursor: pointer;" class="fa fa-layer-group"></i>&nbsp;
<i id="palette${idx}" style="cursor: pointer;" class="fas fa-palette"></i>
</div>`
          htm += layerHtm

          // NAVIGATION TOOLS
          if (numViewers > 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            htm += `<div class="controls showDiv" id="hideTools${idx}"><div id="tools${idx}" class="showHover">`
            // show/hide
//             htm += `<div class="controls showDiv" id="hideTools${idx}" style="color:blue; cursor:pointer;">[+] <BR>
// <div id="tools${idx}" class="showHover">`

            // SLIDERS
            if (opts && opts.slidersOn) {
              slider1 = sliderIdNum += 1
              slider2 = sliderIdNum += 1

              htm += `<div class="range">
<input type="range" id="sliderRange${slider1}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
<input type="range" id="sliderRange${slider2}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
</div>`
            }

            // ANNOTATION TOOLS
            htm += `<div class="floated buttons">`

            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn"><i class="fas fa-pencil-alt"></i> Draw polygon</button>&nbsp;
<button id="btnEdit${idx}" class="btn"><i class="fas fa-draw-polygon"></i> Edit polygon</button>&nbsp;
<button id="btnGrid${idx}" class="btn"><i class="fas fa-border-all"></i> Draw grid</button>&nbsp;
<button id="btnGridMarker${idx}" class="btn"><i class="fas fa-paint-brush"></i> Mark grid</button>&nbsp;
<button id="btnRuler${idx}" class="btn"><i class="fas fa-ruler"></i> Ruler</button>&nbsp;
<button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button></div>`

            // END
            htm += `</div></div>`
          }

          // CREATE VIEWER
          htm += `<table><tr><td><div id="${osdId}" class="viewer drop_site" style="width: ${width}px; height: ${height}px;"></div>
</td><td style="vertical-align: top;"><span id="layers_and_colors${idx}"></span></td>
</tr></table>`

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // ANNOTATION TOOLS - Show/Hide Handler
          // if (opts && opts.toolbarOn) {
          //   let toggle = document.getElementById('hideTools' + idx)
          //   let tools = document.getElementById('tools' + idx)
          //   toggle.addEventListener('click', function () {
          //     if (tools.hidden) {
          //       tools.hidden = false
          //       this.textContent = '[-] '
          //       this.style.color = "maroon"
          //     } else {
          //       tools.hidden = true
          //       this.textContent = '[+] '
          //       this.style.color = "blue"
          //     }
          //   })
          // }

          // DRAW POLYGON COLOR PICKER
          const colorPicker = new CP(document.getElementById('mark' + idx))
          colorPicker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
          })

          // NEED TO PASS THESE TO VIEWER
          let sliderElements = []
          try {
            sliderElements.push(document.getElementById('sliderRange' + slider1))
            sliderElements.push(document.getElementById('sliderRange' + slider2))
          } catch (e) {
            console.error('sliders', e)
          }

          // Pass along data for "this" viewer
          let allFeatures = data.features
          let allOpacity = data.opacities
          let thisData = {
            features: allFeatures[idx],
            opacities: allOpacity[idx]
          }

          // Create MultiViewer object and add to array
          viewers.push(new MultiViewer(idx, osdId, image, thisData, sliderElements, numViewers, opts))

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
    toggleButton(this, 'btnOn', 'btn')
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
    toggleButton(this, 'btnOn', 'btn')

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

function gridHandler(button, gridProps) {
  toggleButton(button, 'btnOn', 'btn')
  const on = button.classList.contains('btnOn')
  if (on) {
    turnGridOn(gridProps)
    gridProps.gridAdded = true
    button.innerHTML = '<i class="fas fa-border-all"></i> Remove grid'
  }

  if (!on) {
    turnGridOff(gridProps)
    gridProps.gridAdded = false
    button.innerHTML = '<i class="fas fa-border-all"></i> Draw grid'
  }
}

function turnGridOff(gridProps) {
  const r = gridProps.canvas.getObjects('line')
  let i
  for (i = 0; i < r.length; i++) {
    gridProps.canvas.remove(r[i])
  }
}

function turnGridOn(gridProps) {
  const lineProps = {stroke: gridProps.color, strokeWidth: 2, selectable: false}

  createHorizontalLines(gridProps, lineProps)
  createVerticalLines(gridProps, lineProps)

  gridProps.canvas.renderAll()
  gridProps.gridAdded = true
}

function createHorizontalLines(gridProps, lineProps) {
  let y
  for (y = 0; y < Math.ceil(gridProps.canvasHeight / gridProps.cellHeight); ++y) {
    gridProps.canvas.add(new fabric.Line([0, y * gridProps.cellHeight, gridProps.canvasWidth, y * gridProps.cellHeight], lineProps))
    gridProps.cellY[y + 1] = y * gridProps.cellHeight // and keep track of the y cells
  }
}

function createVerticalLines(gridProps, lineProps) {
  let x
  for (x = 0; x < Math.ceil(gridProps.canvasWidth / gridProps.cellWidth); ++x) {
    gridProps.canvas.add(new fabric.Line([x * gridProps.cellWidth, 0, x * gridProps.cellWidth, gridProps.canvasHeight], lineProps))
    gridProps.cellX[x + 1] = x * gridProps.cellWidth // and keep track of the x cells
  }
}

function fillInGrid(pointerEvent, gridProps) {
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

function getMousePosition(pointerEvent, gridProps) {
  const pointer = gridProps.canvas.getPointer(pointerEvent.e)
  const positionX = pointer.x / gridProps.cellWidth
  const positionY = pointer.y / gridProps.cellHeight
  return {x: positionX, y: positionY}
}

function getCellPosition(mousePosition) {
  const positionX = Math.ceil(mousePosition.x + 0.001)
  const positionY = Math.ceil(mousePosition.y + 0.001)
  return {x: positionX, y: positionY}
}

function markerHandler(button, gridProps) {
  toggleButton(button, 'btnOn', 'btn')
  const on = button.classList.contains('btnOn')

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
      toggleButton(button, 'btnOn', 'btn') // turn it back off; we're not letting them do this
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

const ruler = function (idx, viewer, overlay) {
  // TODO: turn off event handlers, to not collide with others.
  let line, isDown, mode
  let startx = []
  let endx = []
  let starty = []
  let endy = []
  let temp = 0
  let text

  // let canvas = overlay.fabricCanvas()
  let canvas = overlay.fabricCanvas({ // on/off
    hoverCursor: 'pointer',
    selection: false
  })
  fabric.Object.prototype.transparentCorners = false

  const button = document.getElementById('btnRuler' + idx)
  button.addEventListener('click', function () {
    toggleButton(button, 'btnOn', 'btn')

    if (button.classList.contains('btnOn')) {
      mode = 'draw'
      button.innerHTML = '<i class="fas fa-ruler"></i> Ruler off'
    } else {
      mode = ''
      button.innerHTML = '<i class="fas fa-ruler"></i> Ruler on'
    }
  })

  canvas.on('mouse:down', function (o) {
    if (mode === 'draw') {
      viewer.setMouseNavEnabled(false)
      viewer.outerTracker.setTracking(false)
      isDown = true
      let pointer = canvas.getPointer(o.e)

      // LINE
      let points = [pointer.x, pointer.y, pointer.x, pointer.y]
      startx[temp] = pointer.x
      starty[temp] = pointer.y
      line = new fabric.Line(points, {
        strokeWidth: 2,
        stroke: '#0f0',
        originX: 'center',
        originY: 'center'
      })
      canvas.add(line)
    } else {
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
      canvas.forEachObject(function (o) {
        o.setCoords() // update coordinates
      })
    }
  })

  canvas.on('mouse:move', function (o) {
    canvas.remove(text) // remove text element before re-adding it
    canvas.renderAll() // on/off
    if (!isDown) return
    let pointer = canvas.getPointer(o.e)

    // LINE
    line.set({x2: pointer.x, y2: pointer.y})

    endx[temp] = pointer.x
    endy[temp] = pointer.y

    // TEXT
    if (mode === 'draw') {
      let px = Calculate.lineLength(startx[temp], starty[temp], endx[temp], endy[temp]).toFixed(2)
      text = new fabric.Text('Length ' + px, {left: endx[temp], top: endy[temp], fontSize: 14, fill: '#0f0'})
      canvas.add(text)
    }

    canvas.renderAll()
  })

  canvas.on('mouse:up', function (o) {
    let pointer = canvas.getPointer(o.e)
    isDown = false

    // RECT
    canvas.add(new fabric.Rect({
      left: pointer.x + 1,
      top: pointer.y + 1,
      width: 150,
      height: 25,
      fill: 'rgba(255,255,255,0.5)',
      transparentCorners: true
    }))

    // TEXT
    canvas.add(new fabric.Text(text.text, {
      fontSize: 20,
      left: pointer.x + 1,
      top: pointer.y + 1
    }))

    canvas.renderAll()
  })

  let Calculate = {
    lineLength: function (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 * 1 - x1 * 1, 2) + Math.pow(y2 * 1 - y1 * 1, 2))
    }
  }
}

const markupTools = function (idx, viewer) {
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  drawPolygon(idx, viewer, overlay)
  editPolygon(idx, overlay)
  gridOverlay(idx, overlay)
  ruler(idx, viewer, overlay)
}

function createDraggableDiv(id, title, left, top, viz) {
  let myDiv = document.createElement('div')
  myDiv.id = id
  myDiv.className = 'popup'
  myDiv.style.left = left + 'px'
  myDiv.style.top = top + 'px'

  let myImg = document.createElement('img')
  myImg.src = 'images/close_icon.png'
  myImg.width = 25
  myImg.height = 25
  myImg.alt = 'close'
  myImg.style.cursor = 'pointer'
  myImg.addEventListener('click', function () {
    // this.parentNode.remove()
    myDiv.style.display = 'none'
  })

  let myHeader = document.createElement('div')
  myHeader.id = id + 'Header' // Note the naming convention
  myHeader.className = 'popupHeader'
  myHeader.innerHTML = title
  myHeader.appendChild(myImg)
  myDiv.appendChild(myHeader)

  let body = document.createElement('div')
  body.id = id + 'Body' // Note the naming convention
  // "body" to be filled in by calling function
  myDiv.appendChild(body)
  document.body.appendChild(myDiv)
  if (!viz) {
    myDiv.style.display = 'none' // This gets toggled
  }

  // Make the DIV element draggable
  dragElement(myDiv)

  return myDiv
}

function dragElement(_elem) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0
  // Note the naming convention
  if (document.getElementById(_elem.id + 'Header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(_elem.id + 'Header').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    _elem.onmousedown = dragMouseDown
  }

  // Mouse-down handler
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
    _elem.style.top = (_elem.offsetTop - pos2) + 'px'
    _elem.style.left = (_elem.offsetLeft - pos1) + 'px'
  }

  // Mouse-up handler
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}

let filters = function (viewer, data, button) {
  let div
  if (isRealValue(button)) {
    let id = makeId(5, 'filters')
    let rect = button.getBoundingClientRect()
    div = createDraggableDiv(id, 'Color Levels', rect.left, rect.top)
    createWidget(document.getElementById(`${id}Body`), viewer, data)
  } else {
    console.log('tba')
  }
  return div
}

let createWidget = function (div, viewer, data) {
  const table = document.createElement('table')
  div.appendChild(table)
  // data.sort((a, b) => b.low - a.low) // ORDER BY LOW DESC
  data.forEach(function (elem, ind) {
    let tr = table.insertRow(-1)
    table.appendChild(tr)

    let td = tr.insertCell(-1)
    let colorCode = elem.color

    // COLOR PICKER
    let m = document.createElement('mark')
    m.id = makeId(5, 'marker')
    m.innerHTML = "#" + rgba2hex(colorCode)
    m.style.backgroundColor = colorCode
    td.appendChild(m)

    const picker = new CP(m)
    picker.on('change', function (r, g, b, a) {
      this.source.value = this.color(r, g, b, a)
      this.source.style.backgroundColor = this.color(r, g, b, a)
      data[ind].color = `rgba(${r}, ${g}, ${b}, ${a * 255})` // "color picker" alpha needs to be 1.  "osd" alpha needs to be 255.
      setViewerFilter(data, viewer)
    })

    // LOW
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput({
      id: makeId(5, 'low'),
      val: data[ind].low
    }, viewer, data))

    // HIGH
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput({
      id: makeId(5, 'hi'),
      val: data[ind].hi
    }, viewer, data))

  })
}

function rgba2hex(orig) {
  let a,
    arr = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (arr && arr[4] || "").trim(),
    hex = arr ?
      (arr[1] | 1 << 8).toString(16).slice(1) +
      (arr[2] | 1 << 8).toString(16).slice(1) +
      (arr[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 0x0;
  }
  a = (a | 1 << 8).toString(16).slice(1)
  hex = hex + a
  return hex
}

// NUMBER INPUT to let user set threshold values
function createNumericInput({id, val}, viewer, data) {
  let x = document.createElement('input')
  x.id = id
  x.setAttribute('type', 'number')
  x.min = '0'
  x.max = '255'
  x.step = '1'
  x.value = val.toString()
  x.size = 5

  // x.addEventListener('change', function () {
  //   isIntersect(data, data.length)
  // })

  // this event happens whenever the value changes
  x.addEventListener('input', function () {
    let intVal = parseInt(this.value)

    // If they set it to something outside of 0-255, reset it
    if (intVal > 255) this.value = '255'
    if (intVal < 0) this.value = '0'

    if (this.id.startsWith('low')) {
      data[index].low = parseInt(this.value)
    } else {
      data[index].hi = parseInt(this.value)
      setViewerFilter(data, viewer) // triggered by high value input
    }
  })
  return x
}

// TODO: Don't handle it by ID
/*
function isIntersect(arr, n) {
  // Clear any previous errors
  arr.forEach((element, index) => {
    clearError(document.getElementById('low' + index), document.getElementById('hi' + index))
  })
  // Validate
  for (let i = 1; i < n; i++) {
    if (parseInt(arr[i - 1].hi) < parseInt(arr[i].low)) {
      setError(document.getElementById('low' + i), document.getElementById('hi' + (i - 1)))
      return true
    }
    if (parseInt(arr[i - 1].low) < parseInt(arr[i].hi)) {
      setError(document.getElementById('low' + (i - 1)), document.getElementById('hi' + i))
      return true
    }
  }
  // If we reach here, then no overlap
  return false
}
function setError(a, b) {
  a.style.outlineStyle = 'solid'
  a.style.outlineColor = 'red'
  b.style.outlineStyle = 'solid'
  b.style.outlineColor = 'red'
}
function clearError(a, b) {
  a.style.outlineStyle = ''
  a.style.outlineColor = ''
  b.style.outlineStyle = ''
  b.style.outlineColor = ''
}
 */

// TODO: CHANGE! Set a different color function per layer
// Currently: the same color function for each layer
function setViewerFilter(cr, viewer) {
  try {
    let itemCount = viewer.world.getItemCount()
    let i
    let filterOpts = []
    // For each layer
    for (i = 0; i < itemCount; i++) {
      if (i > 0) { // except the base
        filterOpts.push({
          items: viewer.world.getItemAt(i),
          processors: [
            colorFilter.prototype.COLORLEVELS(cr)
          ]
        })
      }
    }
    viewer.setFilterOptions({
      filters: filterOpts,
      loadMode: 'sync'
    })

  } catch (err) {
    console.error(`setViewerFilter ${err.message}`)
    console.error('cr:', cr, 'viewer:', viewer)
  }
}

let colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = data => (context, callback) => {
  if (context.canvas.width > 0 && context.canvas.height > 0) {
    // Read the canvas pixels
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    if (typeof imgData !== undefined) {
      try {
        const pxl = imgData.data
        let j
        for (j = 0; j < pxl.length; j += 4) {
          if (pxl[j + 3] === 255) {
            let rgba = levels(pxl[j], data) // r = g = b
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
    colorFilter = null
    console.warn('Canvas width and height are 0. Setting filter to null')
  }
}

/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 * @param viewerIndex
 * @param viewerDivId - containing div id
 * @param baseImage
 * @param data - features and opacities
 * @param options
 */
class ImageViewer {
  constructor (viewerIndex, viewerDivId, baseImage, data, options) {
    this.viewer = {}
    this.options = options
    this.setSources(viewerIndex, baseImage, data, this.setViewer(viewerDivId), this.options)
  }

  setViewer (viewerDivId) {
    let viewer
    try {
      viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous',
        immediateRender: true,
        animationTime: 0,
        imageLoaderLimit: 1
        // showNavigator: true,
        // debugMode: true,
        // debugGridColor: "#f9276f"
      })
      // function rstDrawer() {
      //   viewer.drawer.reset()
      // }
    } catch (e) {
      console.warn('setViewer', e)
      viewer = null
    }
    this.viewer = viewer
    return viewer
  }

  getViewer () {
    return this.viewer
  }

  setSources (viewerIndex, baseImage, data, viewer, options) {
    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({ tileSource: baseImage, opacity: 1, x: 0, y: 0 })

      // Add FEATURE layers to viewer
      const features = data.features
      const opacity = data.opacities
      if (features) {
        features.forEach(function (feature, index) {
          viewer.addTiledImage({ tileSource: feature, opacity: opacity[index], x: 0, y: 0 })
        })
      }
      overlayFeatures(viewer, options.colorRanges)
    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

    function overlayFeatures (viewer, colorRanges) {
      try {
        viewer.world.addHandler('add-item', function (event) {
          const itemIndex = viewer.world.getIndexOfItem(event.item)
          if (itemIndex > 0) {
            setViewerFilter(colorRanges, viewer)
            viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
              return getIIIFTileUrl(this, level, x, y)
            }
          }
        })
      } catch (e) {
        console.error('Here we are', e.message)
      }
    }

    function dataCheck (url, jqXHR) {
      const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
      console.warn(message)
      console.log('jqXHR object:', jqXHR)
      console.log('URL', url)
      document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
      throw new Error('Something went wrong.') // Terminates the script.
    }

    function getIIIFTileUrl (source, level, x, y) {
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

let layers = function (divName, viewer, data, button) {
  let div
  if (isRealValue(button)) {
    let id = makeId(5, 'layers')
    let rect = button.getBoundingClientRect()
    div = createDraggableDiv(id, 'Features', rect.left, rect.top)
    createLayerWidget(document.getElementById(`${id}Body`), viewer, data)
    handleDragLayers(viewer)
  } else {
    createLayerWidget(document.getElementById(divName), viewer, data)
    handleDragLayers(viewer)
  }
  return div
}

let eyeball = function (eye, layerNum, viewer) {
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (eye.classList.contains('fa-eye')) {
      // Turn on layer
      l.setOpacity(1)
    } else {
      // Turn off layer
      l.setOpacity(0)
    }
  }
}

let createLayerWidget = function (div, viewer, data) {
  const table = document.createElement('table')
  div.appendChild(table)
  let layers = data.features
  let opacities = data.opacities
  layers.forEach(function (layer, ind) {
    let layerNum = ind + 1 // skip base
    let tr, cell, span, eye, fas
    tr = table.insertRow(-1)
    table.appendChild(tr)

    // DRAGGABLE FEATURE TAB
    cell = tr.insertCell(-1)
    span = document.createElement('span')
    span.className = 'layer_tab'
    span.id = ind + makeId(5, 'feat')
    span.setAttribute('draggable', 'true')
    span.display = 'block'
    span.innerHTML = getStringRep(layer) // WAITING FOR skos:prefLabel
    cell.appendChild(span)

    // EYEBALL VISIBILITY TOGGLE
    cell = tr.insertCell(-1)
    eye = document.createElement('i')
    eye.classList.add('fas')
    if (opacities[ind] === 1)
      eye.classList.add('fa-eye')
    else
      eye.classList.add('fa-eye-slash')
    // eyeball(eye, layerNum, viewer) // viewer.world... undefined here.

    eye.id = makeId(5, 'eye')
    cell.appendChild(eye)

    // EYEBALL EVENT LISTENER
    eye.addEventListener('click', function () {
      toggleButton(eye, 'fa-eye', 'fa-eye-slash')
      eyeball(eye, layerNum, viewer)
    })

    // TRANSPARENCY SLIDER
    cell = tr.insertCell(-1)

    let div = document.createElement('div')
    div.className = 'showDiv'

    let div1 = document.createElement('div')
    div1.className = 'showHover'

    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-adjust')
    fas.classList.add('hover-orange')
    fas.style.cursor = 'pointer'
    div.appendChild(fas)

    let range = document.createElement('input')
    range.type = 'range'
    range.id = makeId(5, 'range')
    range.min = '0'
    range.max = '100'
    range.step = '0.1'
    range.value = opacities[ind] * 100
    range.addEventListener('input', function () {
      const worldItem = viewer.world.getItemAt(layerNum)
      if (worldItem !== undefined) {
        worldItem.setOpacity(this.value / 100) // SET OPACITY
      } else {
        console.warn('worldItem', worldItem)
      }
    })
    div1.appendChild(range)

    div.appendChild(div1)
    cell.appendChild(div)

    // PALETTE COLOR FUNCTION
    cell = tr.insertCell(-1)
    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-palette')
    fas.id = makeId(5, 'palette')
    fas.style.cursor = 'pointer'
    cell.appendChild(fas)
    let widget = filters(viewer, colorRanges, fas)
    fas.addEventListener('click', function (e) {
      widget.style.display = 'block'
    })
  })
}

// DRAGGABLE LAYERS (previously in tabs, now list)
let handleDragLayers = function (viewer) {

  // Features in feature list
  let items = document.querySelectorAll('.layer_tab')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  // The viewer, basically
  items = document.querySelectorAll('.drop_site')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault()
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
    sourceViewer = viewer
    e.dataTransfer.effectAllowed = 'move'
    console.log('e.target.id', e.target.id)
    e.dataTransfer.setData('text', e.target.id)
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  /************ HANDLE DROP ************/
  function handleDrop(e) {
    if (e.preventDefault) e.preventDefault()

    if (dragSrcEl !== this) {
      // TARGET
      const target = e.target
      const closestViewer = target.closest('.viewer')
      if (!closestViewer) {
        return false
      }

      // DRAGGED ITEM
      let movedElemId = e.dataTransfer.getData('text')
      let tmpEl = document.getElementById(movedElemId)
      let tmpId = tmpEl.id
      let tmpHtml = tmpEl.innerHTML
      let items = document.querySelectorAll('.layer_tab')
      for (let i = 0; i < items.length; i++) {
        let layerTab = items[i]
        if (layerTab.innerHTML === tmpHtml && layerTab.id !== tmpId) {
          // Great, we got a match.
          // Toggle eyeball.
          let tds = layerTab.parentElement.parentElement.children
          let eye = tds[1].children[0]
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          layerTab.classList.remove('highlight')
          layerTab.classList.add('highlight')
          break
        }
      }

      // VIEWER
      let targetViewer = getViewerObject(closestViewer)
      let layerNum = movedElemId[0] // 1st char is array index
      console.log('layerNum', layerNum)
      layerNum = parseInt(layerNum) + 1 // (bc 0 = base)
      targetViewer.world.getItemAt(layerNum).setOpacity(1)
      // TODO: Do we want to make it a "move" or a "copy"?
      // sourceViewer.world.getItemAt(layerNum).setOpacity(0)
    }
    return false
  }
}

function getViewerObject(element) {
  let retVal

  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    let j
    for (j = 0; j < syncedImageViewers.length; j++) {
      if (syncedImageViewers[j].getViewer().id === element.id) {
        retVal = syncedImageViewers[j].getViewer()
        break
      }
    }
  } catch (e) {
    console.error('getViewerObject:', e.message)
  }

  return retVal
}

/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId
 * @param baseImage
 * @param data: features and opacities
 * @param sliderElements: 2 slides per image viewer (controls image opacity and overlay opacity).
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, data, sliderElements, numViewers, options) {
    super(viewerIndex, viewerDivId, baseImage, data, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    }

    this.viewer1 = super.getViewer()
    this.idx = viewerIndex
    this.sliders = sliderElements

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

    // LAYERS
    if (typeof data.features !== 'undefined' && options.draggableLayers) {
      // This function is placed to the right of the viewer:
      layers(`layers_and_colors${this.idx}`, this.viewer1, data)
      // Create/handle floating layers div
      let layersBtn = document.getElementById(`layers${this.idx}`)
      let widget = layers('', this.viewer1, data, layersBtn)
      layersBtn.addEventListener('click', function (e) {
        widget.style.display = 'block'
      })
    }

    try {
      // COLOR PALETTE
      let palette = document.getElementById('palette' + this.idx)
      if (typeof options.colorRanges !== 'undefined' && typeof palette !== 'undefined') {
        // Create/handle floating layers div
        let widget = filters(this.viewer1, options.colorRanges, palette)
        palette.addEventListener('click', function (e) {
          widget.style.display = 'block'
        })
      }
    } catch (e) {
      console.error('COLOR PALETTE:', e)
    }
  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

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
