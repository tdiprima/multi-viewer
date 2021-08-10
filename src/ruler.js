let ruler = function (button, viewer, overlay) {
  let line, isDown
  let color = '#b3f836'
  let fontSize = 15
  let zoom
  let mode = 'x'
  let fText
  let fStart = {x: 0, y: 0}
  let fEnd = {x: 0, y: 0}
  let oStartImg, oEndImg

  let canvas = overlay.fabricCanvas()
  fabric.Object.prototype.transparentCorners = false

  function setOsdMove(myBool) {
    viewer.setMouseNavEnabled(myBool)
    viewer.outerTracker.setTracking(myBool)
    viewer.gestureSettingsMouse.clickToZoom = myBool
  }

  function clear() {
    fStart.x = 0.0
    fEnd.x = 0.0
    fStart.y = 0.0
    fEnd.y = 0.0
  }

  function mouseDownHandler(o) {
    clear()
    zoom = viewer.viewport.getZoom(true)
    if (mode === 'draw') {
      setOsdMove(false)
      isDown = true
      let event = o.e

      let webPoint = new OpenSeadragon.Point(event.clientX, event.clientY)
      let imgPoint = viewer.viewport.windowToImageCoordinates(webPoint)
      oStartImg = imgPoint

      let pointer = canvas.getPointer(event)
      let points = [pointer.x, pointer.y, pointer.x, pointer.y]
      fStart.x = pointer.x
      fStart.y = pointer.y
      line = new fabric.Line(points, {
        strokeWidth: 2 / zoom,
        stroke: color,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(line)
    } else {
      setOsdMove(true)
      canvas.forEachObject(function (o) {
        o.setCoords() // update coordinates
      })
    }
  }

  function length(a, b) {
    return Math.abs(a - b);
  }

  function mouseMoveHandler(o) {
    canvas.remove(fText) // remove text element before re-adding it
    canvas.renderAll()
    if (!isDown) return
    let event = o.e
    let webPoint = new OpenSeadragon.Point(event.clientX, event.clientY)
    let imgPoint = viewer.viewport.windowToImageCoordinates(webPoint)
    oEndImg = imgPoint
    let w = length(oStartImg.x, oEndImg.x)
    let h = length(oStartImg.y, oEndImg.y)
    let t = valueWithUnit(Math.sqrt(w * w * microns_per_pix * microns_per_pix + h * h * microns_per_pix * microns_per_pix))
    console.log(`%c${t}`, 'color: yellow;')
    let pointer = canvas.getPointer(event)
    line.set({x2: pointer.x, y2: pointer.y})
    fEnd.x = pointer.x
    fEnd.y = pointer.y

    if (mode === 'draw') {
      // Show info while drawing line
      fText = new fabric.Text(t, {
        left: fEnd.x,
        top: fEnd.y,
        fontSize: zoom >= 100 ? 0.2 : (fontSize / zoom).toFixed(3),
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(fText)
    }

    canvas.renderAll()
  }

  function valueWithUnit(value) {
    if (value < 0.000001) {
      return `${(value * 1000000000).toFixed(3)} fm`
    }
    if (value < 0.001) {
      return `${(value * 1000000).toFixed(3)} pm`
    }
    if (value < 1) {
      return `${(value * 1000).toFixed(3)} nm`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(3)} mm`
    }
    return `${(value).toFixed(3)} \u00B5m`
  }

  function mouseUpHandler(o) {
    canvas.remove(fText)
    isDown = false
    let event = o.e
    let width = length(oStartImg.x, oEndImg.x)
    let height = length(oStartImg.y, oEndImg.y)
    let text = valueWithUnit(Math.sqrt(width * width * microns_per_pix * microns_per_pix + height * height * microns_per_pix * microns_per_pix))
    console.log(`%c${text}`, 'color: orange;')
    let pointer = canvas.getPointer(event)
    let left = pointer.x
    let top = pointer.y

    // Make sure user actually drew a line
    if (fEnd.x > 0) {
      // Show end result
      console.log(`%clength: ${text}`, `color: ${color};`)
      canvas.add(new fabric.Rect({
        left: left,
        top: top,
        width: 150 / zoom,
        height: 25 / zoom,
        rx: 5 / zoom,
        ry: 5 / zoom,
        fill: color,
        transparentCorners: true,
        selectable: false,
        evented: false,
        name: 'ruler'
      }))
      canvas.add(new fabric.Text(text, {
        fontSize: zoom >= 100 ? 0.2 : (fontSize / zoom).toFixed(2),
        left: left,
        top: top,
        selectable: false,
        evented: false,
        name: 'ruler'
      }))
      canvas.renderAll()
    }
  }

  button.addEventListener('click', function () {
    if (mode === 'draw') {
      // Turn off
      canvas.remove(...canvas.getItemsByName('ruler')) // TODO: Make an X to remove.
      // canvas.remove(...canvas.getObjects())
      mode = 'x'
      canvas.off('mouse:down', mouseDownHandler)
      canvas.off('mouse:move', mouseMoveHandler)
      canvas.off('mouse:up', mouseUpHandler)
    } else {
      // Turn on
      mode = 'draw'
      canvas.on('mouse:down', mouseDownHandler)
      canvas.on('mouse:move', mouseMoveHandler)
      canvas.on('mouse:up', mouseUpHandler)
    }
    toggleButton(button, 'btnOn', 'btn')
  })

}
