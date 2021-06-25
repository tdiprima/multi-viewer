let PDR = OpenSeadragon.pixelDensityRatio;
const ruler = function (button, viewer, overlay) {
  let line, isDown
  let startx = 0.0
  let endx = 0.0
  let starty = 0.0
  let endy = 0.0
  let lineLength = 0.0
  let mode = 'x'
  let text
  let color = '#b3f836'
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
    lineLength = 0.0
  }

  function mouseDownHandler(o) {
    clear()
    if (mode === 'draw') {
      setOsdMove(false)
      isDown = true
      let pointer = canvas.getPointer(o.e)

      let points = [pointer.x, pointer.y, pointer.x, pointer.y]
      startx = pointer.x
      starty = pointer.y
      line = new fabric.Line(points, {
        strokeWidth: 2 / viewer.viewport.getZoom(true),
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
      lineLength = Calculate.lineLength(startx, starty, endx, endy).toFixed(2)
      text = new fabric.Text(` Length ${lineLength * 4} \u00B5`, {
        left: endx,
        top: endy,
        fontSize: 15 / viewer.viewport.getZoom(true),
        selectable: false,
        evented: false,
        name: 'ruler'
      })
      canvas.add(text)
    }

    canvas.renderAll()
  }

  function mouseUpHandler(o) {
    let pointer = canvas.getPointer(o.e)
    let zoom = viewer.viewport.getZoom(true)
    isDown = false

    // Make sure user actually drew a line
    if (endx > 0) {
      // Show end result
      console.info('lineLength', lineLength * 4 + ' \u00B5')
      canvas.add(new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
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
        fontSize: 20 / zoom,
        left: pointer.x,
        top: pointer.y,
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
      canvas.off('mouse:down', function (o) { mouseDownHandler(o) })
      canvas.off('mouse:move', function (o) { mouseMoveHandler(o) })
      canvas.off('mouse:up', function (o) { mouseUpHandler(o) })
    } else {
      // Turn on
      mode = 'draw'
      canvas.on('mouse:down', function (o) { mouseDownHandler(o) })
      canvas.on('mouse:move', function (o) { mouseMoveHandler(o) })
      canvas.on('mouse:up', function (o) { mouseUpHandler(o) })
    }
    toggleButton(button, 'btnOn', 'btn')
  })

  let Calculate = {
    lineLength: function (x1, y1, x2, y2) { // Line length
      return Math.sqrt(Math.pow(x2 * PDR - x1 * PDR, 2) + Math.pow(y2 * PDR - y1 * PDR, 2))
    }
  }
}
