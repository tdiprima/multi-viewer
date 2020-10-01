// Grid handler (and grid paint)
function gridOverlay (idx, viewer, overlay) {
  const canvas = overlay.fabricCanvas()

  const btnGrid = document.getElementById('btnGrid' + idx)
  const cellX = []; const cellY = []; const cellSize = 50; let gridAdded = false; let gridWidth; let gridHeight

  function renderGrid (width, height, cellWidth, cellHeight, color) {
    const lineOption = { stroke: color, strokeWidth: 2, selectable: false }

    // Horizontal grid lines
    for (let y = 0; y < Math.ceil(height / cellHeight); ++y) {
      canvas.add(new fabric.Line([0, y * cellHeight, width, y * cellHeight], lineOption))
      cellY[y + 1] = y * cellHeight
    }

    // Vertical grid lines
    for (let x = 0; x < Math.ceil(width / cellWidth); ++x) {
      canvas.add(new fabric.Line([x * cellWidth, 0, x * cellWidth, height], lineOption))
      cellX[x + 1] = x * cellWidth
    }
    canvas.renderAll()
    gridAdded = true
  }

  // Grid button event handler
  btnGrid.addEventListener('click', function () {
    // TODO: grid at max scale?
    gridWidth = Math.ceil(canvas.width)
    gridHeight = Math.ceil(canvas.height)

    if (btnGrid.classList.contains('btnOn')) {
      // Remove only the lines
      const r = canvas.getObjects('line')
      for (let i = 0; i < r.length; i++) {
        canvas.remove(r[i])
      }
      btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Draw grid'
      gridAdded = false
    } else {
      // DRAW GRID
      renderGrid(gridWidth, gridHeight, cellSize, cellSize, 'red')
      btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Remove grid'
      gridAdded = true
    }

    toggleButton(btnGrid)
  })

  // Grid Marker
  const btnMarker = document.getElementById('btnMarker' + idx)
  btnMarker.addEventListener('click', markerHandler)

  // Get coordinates of mouse pointer, and fill in the square of the grid.
  function mouseCoords (options) {
    // TODO: what makes a box disappear sometimes?
    const event = options.e
    const pointer = canvas.getPointer(event)
    const cx = pointer.x
    const cy = pointer.y
    const x = cx / cellSize
    const y = cy / cellSize
    const imoX = Math.ceil(x + 0.001) // IsMouseOverX (mouse(block) position on grid)
    const imoY = Math.ceil(y + 0.001) // IsMouseOverY (mouse(block) position on grid)

    // Fill in the grid
    const rect = new fabric.Rect({
      left: cellX[imoX],
      top: cellY[imoY],
      fill: 'red',
      width: cellSize,
      height: cellSize,
      opacity: 0.5,
      selectable: false
    })
    canvas.add(rect)
  }

  // Grid marker event handler
  function markerHandler () {
    let toggle = true
    if (btnMarker.classList.contains('btnOn')) {
      // Remove mouse:move listener (we also use it for other things)
      canvas.off('mouse:move', mouseCoords)
      btnMarker.innerHTML = '<i class="fa fa-paint-brush"></i> Mark grid'
    } else {
      if (!gridAdded) {
        toggle = false
        alertMessage('Please draw a grid first.')
      } else {
        // Add listener
        canvas.on('mouse:move', mouseCoords)
        btnMarker.innerHTML = '<i class="fa fa-paint-brush"></i> Done marking'
      }
    }
    if (toggle) {
      toggleButton(btnMarker)
    }
  }
}
