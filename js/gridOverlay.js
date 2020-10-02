function gridOverlay (idx, viewer, overlay) {
  const canvas = overlay.fabricCanvas()
  const cellX = []
  const cellY = []
  const cellSize = 50
  let gridAdded = false

  const btnGrid = document.getElementById('btnGrid' + idx)
  btnGrid.addEventListener('click', function () {
    gridHandler(this)
  })

  const btnGridMarker = document.getElementById('btnGridMarker' + idx)
  btnGridMarker.addEventListener('click', function () {
    markerHandler(this)
  })

  function gridHandler (button) {
    toggleButtonHighlight(button)

    if (buttonIsOn(button)) {
      const gridProperties = {
        canvasWidth: Math.ceil(canvas.width),
        canvasHeight: Math.ceil(canvas.height),
        cellWidth: cellSize,
        cellHeight: cellSize,
        color: 'red'
      }
      turnGridOn(gridProperties)
      gridAdded = true
      button.innerHTML = '<i class="fa fa-border-all"></i> Remove grid'
    }

    if (!buttonIsOn(button)) {
      turnGridOff()
      gridAdded = false
      button.innerHTML = '<i class="fa fa-border-all"></i> Draw grid'
    }
  }

  function buttonIsOn (button) {
    return button.classList.contains('btnOn')
  }

  function turnGridOff () {
    const r = canvas.getObjects('line')
    for (let i = 0; i < r.length; i++) {
      canvas.remove(r[i])
    }
  }

  function turnGridOn (gridProps) {
    const lineProps = { stroke: gridProps.color, strokeWidth: 2, selectable: false }

    createHorizontalLines(gridProps, lineProps)

    createVerticalLines(gridProps, lineProps)

    canvas.renderAll()
    gridAdded = true
  }

  function createHorizontalLines (gridProps, lineProps) {
    for (let y = 0; y < Math.ceil(gridProps.canvasHeight / gridProps.cellHeight); ++y) {
      canvas.add(new fabric.Line([0, y * gridProps.cellHeight, gridProps.canvasWidth, y * gridProps.cellHeight], lineProps))
      cellY[y + 1] = y * gridProps.cellHeight // and keep track of the y cells
    }
  }

  function createVerticalLines (gridProps, lineProps) {
    for (let x = 0; x < Math.ceil(gridProps.canvasWidth / gridProps.cellWidth); ++x) {
      canvas.add(new fabric.Line([x * gridProps.cellWidth, 0, x * gridProps.cellWidth, gridProps.canvasHeight], lineProps))
      cellX[x + 1] = x * gridProps.cellWidth // and keep track of the x cells
    }
  }

  function mouseCoords (options) {
    const mousePosition = getMousePosition(options)
    const cellPosition = getCellPosition(mousePosition)

    fillInGrid(cellPosition)
  }

  function fillInGrid (cellPosition) {
    const rect = new fabric.Rect({
      left: cellX[cellPosition.x],
      top: cellY[cellPosition.y],
      fill: 'red',
      width: cellSize,
      height: cellSize,
      opacity: 0.5,
      selectable: false
    })
    canvas.add(rect)
  }

  function getMousePosition (options) {
    console.log(options)
    const pointer = canvas.getPointer(options.e)
    const positionX = pointer.x / cellSize
    const positionY = pointer.y / cellSize
    return { x: positionX, y: positionY }
  }

  function getCellPosition (mousePosition) {
    const positionX = Math.ceil(mousePosition.x + 0.001)
    const positionY = Math.ceil(mousePosition.y + 0.001)
    return { x: positionX, y: positionY }
  }

  function markerHandler (button) {
    toggleButtonHighlight(button)

    if (!buttonIsOn(button)) {
      // Done marking; remove mouse:move listener because we use it for other things.
      canvas.off('mouse:move', mouseCoords)
      btnGridMarker.innerHTML = '<i class="fa fa-paint-brush"></i> Mark grid'
    } else {
      if (gridAdded) {
        canvas.on('mouse:move', mouseCoords)
        btnGridMarker.innerHTML = '<i class="fa fa-paint-brush"></i> Done marking'
      } else {
        toggleButtonHighlight(btnGridMarker) // turn it back off; we're not letting them do this
        alertMessage('Please draw a grid first.')
      }
    }
  }
}
