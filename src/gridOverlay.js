/**
 * Draw a grid over the canvas and allow the user to mark the squares.
 * For demonstration purposes.
 *
 * @param btnGrid: clickable grid icon
 * @param btnGridMarker: clickable marker icon
 * @param overlay: draw the grid on this canvas
 */
const gridOverlay = (btnGrid, btnGridMarker, overlay) => {
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

  btnGrid.addEventListener('click', function () {
    gridHandler(this, gridProps)
  })

  btnGridMarker.addEventListener('click', function () {
    markerHandler(this, gridProps)
  })
}

function gridHandler (button, gridProps) {
  toggleButton(button, 'btnOn', 'btn')
  const on = button.classList.contains('btnOn')
  if (on) {
    turnGridOn(gridProps)
    gridProps.gridAdded = true
    // button.innerHTML = '<i class="fas fa-border-all"></i> Remove grid'
  }

  if (!on) {
    turnGridOff(gridProps)
    gridProps.gridAdded = false
    // button.innerHTML = '<i class="fas fa-border-all"></i> Draw grid'
  }
}

function turnGridOff (gridProps) {
  const r = gridProps.canvas.getObjects('line')
  for (let i = 0; i < r.length; i++) {
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
  toggleButton(button, 'btnOn', 'btn')
  const on = button.classList.contains('btnOn')

  if (!on) {
    // Done marking; remove mouse:move listener because we use it for other things.
    gridProps.canvas.__eventListeners['mouse:move'] = []
    // button.innerHTML = '<i class="fas fa-paint-brush"></i> Mark grid'
  }

  if (on) {
    if (gridProps.gridAdded) {
      gridProps.canvas.on('mouse:move', pointerEvent => {
        fillInGrid(pointerEvent, gridProps)
      })
      // button.innerHTML = '<i class="fas fa-paint-brush"></i> Done marking'
    } else {
      toggleButton(button, 'btnOn', 'btn') // turn it back off; we're not letting them do this
      alertMessage('Please draw a grid first.')
    }
  }
}
