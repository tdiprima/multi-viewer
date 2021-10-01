let layers = function (divEl, itemsToBeDisplayed, viewer) {
  createLayerWidget(divEl, itemsToBeDisplayed, viewer)
  handleDragLayers(viewer)
}

function createLayerWidget(div, itemsToBeDisplayed, viewer) {
  const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm
  const table = e('table')
  div.appendChild(table)

  itemsToBeDisplayed.forEach(function (layer) {
    let layerNum = layer.layerNum

    let tr = e('tr')
    table.appendChild(tr)

    // Feature (draggable)
    let feat = e('span', {
      id: `${layerNum}${makeId(5, 'feat')}`,
      class: 'dragIt',
      display: 'block',
      draggable: 'true'
    })

    // NAME
    let loc = layer.location
    if (typeof layer.prefLabel !== 'undefined') {
      feat.innerHTML = layer.prefLabel
      // NOTE: temporary hack until we get prefLabel:
    } else if (loc.includes('HalcyonStorage') && loc.includes('TCGA')) {
      let name = loc.substring(loc.indexOf('HalcyonStorage') + 15, loc.indexOf('TCGA') - 1)
      feat.innerHTML = name
      layer.prefLabel = name
    } else if (loc.includes('TCGA')) {
      if (loc.match(regex) !== null) {
        let name = loc.match(regex)[0]
        feat.innerHTML = name
        layer.prefLabel = name
      } else {
        let name = getStringRep(loc)
        feat.innerHTML = name
        layer.prefLabel = name
      }
    } else {
      feat.innerHTML = 'Feature'
      layer.prefLabel = 'Feature'
    }

    tr.appendChild(e('td', {}, [feat]))

    // eyeball visibility toggle
    let faEye = e('i', {id: makeId(5, 'eye'), class: layer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'})
    tr.appendChild(e('td', {}, [faEye]))

    // transparency slider
    let faAdjust = document.createElement('i')
    faAdjust.classList.add('fas')
    faAdjust.classList.add('fa-adjust')
    faAdjust.classList.add('hover-light')
    faAdjust.style.cursor = 'pointer'
    let div = e('div', {class: 'showDiv'}, [faAdjust])

    let range = e('input', {
      type: 'range',
      id: makeId(5, 'range'),
      min: '0',
      max: '100',
      step: '0.1',
      value: (layer.opacity * 100).toString()
    })

    range.addEventListener('input', function () {
      const worldItem = viewer.world.getItemAt(layerNum)
      if (worldItem !== undefined) {
        worldItem.setOpacity(this.value / 100)
        if (this.value === '0') {
          faEye.classList.remove('fa-eye')
          faEye.classList.add('fa-eye-slash')
        }
        if (parseFloat(this.value) > 0) {
          faEye.classList.remove('fa-eye-slash')
          faEye.classList.add('fa-eye')
        }
      } else {
        console.warn('worldItem', worldItem)
      }
    })

    faEye.addEventListener('click', function () {
      toggleButton(faEye, 'fa-eye', 'fa-eye-slash')
      eyeball(faEye, range, layerNum, viewer)
    })

    div.appendChild(e('div', {class: 'showHover'}, [range]))
    tr.appendChild(e('td', {}, [div]))

    if (layerNum > 0) {
      let palette = e('i', {class: 'fas fa-palette pointer', id: makeId(5, 'palette')})
      tr.appendChild(e('td', {}, [palette]))
      let colorsUI = filters(palette, layer.prefLabel, layer.colors, itemsToBeDisplayed, viewer)
      palette.addEventListener('click', function () {
        colorsUI.style.display = 'block'
      })
    } else {
      tr.appendChild(e('td'))
    }
  })
}

// DRAGGABLE LAYERS
function handleDragLayers(viewer) {
  // Features in feature list
  let features = document.querySelectorAll('.dragIt')
  features.forEach(function (feature) {
    feature.setAttribute('draggable', 'true')
    feature.addEventListener('dragstart', handleDragStart)
    feature.addEventListener('dragend', handleDragEnd)
  })

  // The viewer, basically
  let viewerDivs = document.querySelectorAll('.dropzone')
  viewerDivs.forEach(function (viewerDiv) {
    viewerDiv.addEventListener('dragenter', function () { this.classList.add('over') })
    viewerDiv.addEventListener('dragleave', function () { this.classList.remove('over') })
    viewerDiv.addEventListener('dragover', function (evt) { if (evt.preventDefault) evt.preventDefault(); return false })
    viewerDiv.addEventListener('drop', handleDrop)
  })

  function handleDragStart(evt) {
    dragSrcEl = this // The draggable feature
    this.style.opacity = '0.4'
    sourceViewer = viewer
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text', evt.target.id)
  }

  function handleDragEnd() {
    // this = the draggable feature
    this.style.opacity = '1'
    viewerDivs.forEach(function (viewerDiv) {
      viewerDiv.classList.remove('over')
    })
  }

  function handleDrop(evt) {
    // this = dropzone viewer
    if (evt.preventDefault) evt.preventDefault()

    if (dragSrcEl !== this) {
      // target
      const target = evt.target // fabric upper-canvas
      const targetDiv = target.closest('.viewer') // returns the real target
      if (!targetDiv) return false;

      let layersColumn = targetDiv.parentElement.nextSibling.firstChild
      let myTable = layersColumn.firstChild

      let movedElemId = evt.dataTransfer.getData('text')
      let movedElem = document.getElementById(movedElemId)
      let name = movedElem.innerHTML

      let layNum
      for (let row of myTable.rows) {
        let lay = row.cells[0].firstChild
        layNum = lay.id[0] // 1st char is array index)
        let eye = row.cells[1].children[0]
        if (lay.innerHTML === name) {
          // Highlight the layer
          lay.classList.remove('highlight') // just in case.
          lay.classList.add('highlight')
          // Toggle eyeball
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          break
        }
      }

      // viewer
      let targetViewer = getViewerObject(targetDiv)
      targetViewer.world.getItemAt(layNum).setOpacity(1) // show
      // sourceViewer.world.getItemAt(XXX).setOpacity(0) // hide
    }
    return false
  }
}

function eyeball(eye, range, layerNum, viewer) {
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (eye.classList.contains('fa-eye-slash')) {
      l.setOpacity(0) // Turn off layer
      range.value = '0' // Set slider to 0
    } else {
      l.setOpacity(1) // Turn on layer
      range.value = '100' // Set slider to (opacity * 100)
    }
  }
}

function getViewerObject(element) {
  let retVal
  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    for (let j = 0; j < syncedImageViewers.length; j++) {
      if (syncedImageViewers[j].getViewer().id === element.id) {
        retVal = syncedImageViewers[j].getViewer()
        break
      }
    }
  } catch (e) {
    console.error(`%cgetViewerObject: ${e.message}`, 'font-size: larger;')
  }
  return retVal
}
