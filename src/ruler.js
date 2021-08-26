let ruler = function (button, viewer, overlay) {
  let line, isDown
  let color = '#b3f836'
  let fontSize = 15
  let zoom
  let mode = 'x'
  let fText
  let fStart = {x: 0, y: 0}
  let fEnd = {x: 0, y: 0}
  let oStart, oEnd

  let canvas = overlay.fabricCanvas()
  fabric.Object.prototype.transparentCorners = false
  // let canvas = this.__canvas = overlay.fabricCanvas()

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
      setOsdMove(viewer, false)
      isDown = true
      let event = o.e

      let webPoint = new OpenSeadragon.Point(event.clientX, event.clientY)
      try {
        let viewportPoint = viewer.viewport.pointFromPixel(webPoint)
        oStart = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint)
      } catch (e) {
        console.log(`%cHere we are. ${e.message}`, 'color: #ff6a5a;')
      }

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
      setOsdMove(viewer, true)
      canvas.forEachObject(function (o) {
        o.setCoords() // update coordinates
      })
    }
  }

  function difference(a, b) {
    return Math.abs(a - b);
  }

  function getHypotenuseLength(a, b, mpp) {
    return Math.sqrt((a * a * mpp * mpp) + (b * b * mpp * mpp))
  }

  function mouseMoveHandler(o) {
    canvas.remove(fText) // remove text element before re-adding it
    canvas.renderAll()
    if (!isDown) return
    let event = o.e
    let webPoint = new OpenSeadragon.Point(event.clientX, event.clientY)
    // oEnd = viewer.viewport.windowToImageCoordinates(webPoint)

    try {
      let viewportPoint = viewer.viewport.pointFromPixel(webPoint)
      oEnd = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint)
    } catch (e) {
      console.log(`%cHere we are. ${e.message}`, 'color: #ff6a5a;')
    }

    let w = difference(oStart.x, oEnd.x)
    let h = difference(oStart.y, oEnd.y)
    let hypot = getHypotenuseLength(w, h, microns_per_pix)
    let t = valueWithUnit(hypot)
    // console.log('t', t)
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
      // 1 µ = 1e+9 fm
      return `${(value * 1000000000).toFixed(3)} fm`
    }
    if (value < 0.001) {
      // 1 µ = 1e+6 pm
      return `${(value * 1000000).toFixed(3)} pm`
    }
    if (value < 1) {
      // 1 µ = 1000 nm
      return `${(value * 1000).toFixed(3)} nm`
    }
    if (value >= 1000) {
      // 1 µ = 0.001 mm
      return `${(value / 1000).toFixed(3)} mm`
    }
    // 1 µ
    return `${(value).toFixed(3)} \u00B5m`
  }

  function mouseUpHandler(o) {
    line.setCoords()
    canvas.remove(fText)
    isDown = false
    let pointer = canvas.getPointer(event)
    let x = pointer.x
    let y = pointer.y

    // Make sure user actually drew a line
    if (fEnd.x > 0) {
      // Show end result
      console.log(`%clength: ${fText.text}`, `color: ${color};`)
      let rect = new fabric.Rect({
        left: x,
        top: y,
        width: 150 / zoom,
        height: 25 / zoom,
        rx: 5 / zoom,
        ry: 5 / zoom,
        fill: color,
        transparentCorners: true,
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      let t = new fabric.Text(fText.text, {
        fontSize: zoom >= 100 ? 0.2 : (fontSize / zoom).toFixed(2),
        left: x,
        top: y,
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      let group = new fabric.Group([rect, t], {
        left: x,
        top: y,
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(group)
      canvas.renderAll()
    }
  }

  button.addEventListener('click', function () {
    if (mode === 'draw') {
      // Turn off
      canvas.remove(...canvas.getItemsByName('ruler'))
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
