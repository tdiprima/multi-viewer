const ruler = function (button, viewer, overlay) {
  let line, isDown
  let startx = 0.0
  let endx = 0.0
  let starty = 0.0
  let endy = 0.0
  let length_in_px = 0.0
  let actual_pixels = 0.0
  let length_in_microns = 0.0
  let color = '#b3f836'
  const fontSize = 15
  let zoom
  let mode = 'x'
  let text

  let canvas = this.__canvas = overlay.fabricCanvas()
  fabric.Object.prototype.transparentCorners = false

  function setOsdMove(myBool) {
    viewer.setMouseNavEnabled(myBool)
    viewer.outerTracker.setTracking(myBool)
    viewer.gestureSettingsMouse.clickToZoom = myBool
  }

  function clear() {
    startx = 0.0
    endx = 0.0
    starty = 0.0
    endy = 0.0
    length_in_px = 0.0
    actual_pixels = 0.0
    length_in_microns = 0.0
  }

  function mouseDownHandler(o) {
    clear()
    zoom = viewer.viewport.getZoom(true)
    if (mode === 'draw') {
      setOsdMove(false)
      isDown = true
      let pointer = canvas.getPointer(o.e)
      let points = [pointer.x, pointer.y, pointer.x, pointer.y]
      startx = pointer.x
      starty = pointer.y
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

  function mouseMoveHandler(o) {
    canvas.remove(text) // remove text element before re-adding it
    canvas.renderAll()
    if (!isDown) return
    let pointer = canvas.getPointer(o.e)
    line.set({x2: pointer.x, y2: pointer.y})
    endx = pointer.x
    endy = pointer.y

    if (mode === 'draw') {
      // Show info while drawing line
      length_in_microns = Calculate.lineLength(startx, starty, endx, endy)
      text = new fabric.Text(` Length ${length_in_microns.toFixed(3)} \u00B5`, {
        left: endx,
        top: endy,
        fontSize: zoom >= 100 ? 0.2 : (fontSize / zoom).toFixed(3),
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(text)
    }

    canvas.renderAll()
  }

  function mouseUpHandler(o) {
    canvas.remove(text)
    isDown = false
    let pointer = canvas.getPointer(o.e)
    let left = pointer.x
    let top = pointer.y

    // Make sure user actually drew a line
    if (endx > 0) {
      // Show end result
      console.log(`%clength_in_microns: ${length_in_microns.toFixed(3)}`, `color: ${color};`)
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
      canvas.add(new fabric.Text(text.text, {
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

  let Calculate = {
    lineLength: function (x1, y1, x2, y2) {
      let a = x1 - x2;
      let b = y1 - y2;
      length_in_px = Math.sqrt(a * a + b * b);
      actual_pixels = length_in_px * PDR
      length_in_microns = actual_pixels * pix_per_micron
      return length_in_microns;
    }
  }
}
