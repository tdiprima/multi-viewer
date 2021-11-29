let ruler = (button, viewer, overlay) => {
  let line;
  let isDown;
  let zoom
  let mode = 'x'
  let fText
  let fStart = {x: 0, y: 0}
  let fEnd = {x: 0, y: 0}
  let oStart;
  let oEnd;

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
        console.error(`%c${e.message}`, 'font-size: larger;')
      }

      let pointer = canvas.getPointer(event)
      let points = [pointer.x, pointer.y, pointer.x, pointer.y]
      fStart.x = pointer.x
      fStart.y = pointer.y
      line = new fabric.Line(points, {
        strokeWidth: 2 / zoom,
        stroke: '#0f0',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(line)
    } else {
      setOsdMove(viewer, true)
      canvas.forEachObject(o => {
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

  function drawText(x, y, text, showRect) {
    let rect = new fabric.Rect({
      left: x,
      top: y,
      width: 150 / zoom,
      height: 25 / zoom,
      rx: 5 / zoom,
      ry: 5 / zoom,
      fill: 'rgba(255,255,255,0.5)',
      transparentCorners: true,
      selectable: false,
      evented: false,
      name: 'ruler'
    })

    fText = new fabric.Text(text, {
      left: x,
      top: y,
      fontFamily: 'Verdana',
      fill: 'black',
      selectable: false,
      evented: false,
      name: 'ruler'
    })
    fText.scaleToWidth(rect.width)

    if (showRect) {
      canvas.add(rect)
    }
    canvas.add(fText)
  }

  function mouseMoveHandler(o) {
    if (!isDown) return
    canvas.remove(fText) // remove text element before re-adding it
    canvas.renderAll()

    let event = o.e
    let webPoint = new OpenSeadragon.Point(event.clientX, event.clientY)
    // oEnd = viewer.viewport.windowToImageCoordinates(webPoint)
    let viewportPoint = viewer.viewport.pointFromPixel(webPoint)
    oEnd = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint)

    let w = difference(oStart.x, oEnd.x)
    let h = difference(oStart.y, oEnd.y)
    let hypot = getHypotenuseLength(w, h, microns_per_pix)
    let t = valueWithUnit(hypot)

    let pointer = canvas.getPointer(event)
    line.set({x2: pointer.x, y2: pointer.y})
    fEnd.x = pointer.x
    fEnd.y = pointer.y

    if (mode === 'draw') {
      // Show info while drawing line
      drawText(fEnd.x, fEnd.y, t, false)
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

    // Make sure user actually drew a line
    if (fEnd.x > 0) {
      console.log(`%clength: ${fText.text}`, 'color: #ccff00;')
      let pointer = canvas.getPointer(event)
      drawText(pointer.x, pointer.y, fText.text, zoom < 100)
      canvas.renderAll()
    }
  }

  button.addEventListener('click', () => {
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
