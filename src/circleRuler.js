const ruler = function (idx, viewer, overlay) {
  console.log('ruler.js')
  // TODO: FIX so that the straight line goes across diameter of circle instead of just the radius.
  let circle, line, text, isDown, origX, origY
  let startx = []
  let endx = []
  let starty = []
  let endy = []
  let temp = 0
  let mode = 'draw'

  // let canvas = overlay.fabricCanvas()
  let canvas = overlay.fabricCanvas({
    hoverCursor: 'pointer',
    selection: false
  })
  fabric.Object.prototype.transparentCorners = false

  const button = document.getElementById('btnRuler' + idx)
  button.addEventListener('click', function () {
    toggleButtonHighlight(button)

    if (buttonIsOn(button)) {
      mode = 'draw'
      button.innerHTML = '<i class="fas fa-ruler"></i> Ruler off'
    } else {
      mode = ''
      button.innerHTML = '<i class="fas fa-ruler"></i> Ruler on'

      canvas.isDrawingMode = false
      canvas.selection = true
      canvas.off('mouse:down')
      canvas.off('mouse:move')
      canvas.off('mouse:up')
      canvas.forEachObject(function (o) {
        o.setCoords()
      })
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

      // CIRCLE
      origX = pointer.x
      origY = pointer.y
      circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 1,
        strokeWidth: 2,
        stroke: '#0f0',
        fill: '',
        strokeDashArray: [10],
        selectable: true,
        originX: 'center',
        originY: 'center'
      })
      canvas.add(circle)

      // GROUP
      // const group = new fabric.Group([circle, line], {
      //   left: pointer.x,
      //   top: pointer.y
      // })
      // canvas.add(group)
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
    canvas.renderAll()
    if (!isDown) return
    let pointer = canvas.getPointer(o.e)

    // LINE
    line.set({
      x2: pointer.x,
      y2: pointer.y
    })

    endx[temp] = pointer.x
    endy[temp] = pointer.y

    // CIRCLE
    circle.set({
      radius: Math.abs(origX - pointer.x)
    })

    // TEXT
    if (mode === 'draw') {
      let px = Calculate.lineLength(startx[temp], starty[temp], endx[temp], endy[temp]).toFixed(2)
      text = new fabric.Text('Length ' + px, {
        left: endx[temp],
        top: endy[temp],
        fontSize: 14,
        fill: '#0f0'
      })
      canvas.add(text)
    }

    canvas.renderAll()
  })

  canvas.on('mouse:up', function (o) {
    let pointer = canvas.getPointer(o.e)
    isDown = false
    // mode = ''

    // TODO: fix - don't draw on click without drag
    // retain measurement
    if (mode === 'draw') {
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
    }
  })

  let Calculate = {
    lineLength: function (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 * 1 - x1 * 1, 2) + Math.pow(y2 * 1 - y1 * 1, 2))
    }
  }
}
