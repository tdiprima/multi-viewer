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
      class: 'layer_tab',
      id: `${layerNum}${makeId(5, 'feat')}`,
      draggable: 'true',
      display: 'block'
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

// DRAGGABLE LAYERS (previously in tabs, now list)
function handleDragLayers(viewer) {
  // Features in feature list
  let items = document.querySelectorAll('.layer_tab')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('dragstart', handleDragStart)
    item.addEventListener('dragend', handleDragEnd)
  })

  // The viewer, basically
  items = document.querySelectorAll('.drop_site')
  items.forEach(function (item) {
    item.addEventListener('dragenter', function () { this.classList.add('over') })
    item.addEventListener('dragleave', function () { this.classList.remove('over') })
    item.addEventListener('dragover', function (evt) { if (evt.preventDefault) evt.preventDefault(); return false })
    item.addEventListener('drop', handleDrop)
  })

  function handleDragStart(evt) {
    this.style.opacity = '0.4'
    dragSrcEl = this // The draggable feature
    sourceViewer = viewer
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text', evt.target.id)
  }

  function handleDragEnd() {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  function handleDrop(evt) {
    if (evt.preventDefault) evt.preventDefault()

    if (dragSrcEl !== this) {
      // target
      const target = evt.target
      const closestViewer = target.closest('.viewer')
      if (!closestViewer) return false;

      // dragged item
      let movedElemId = evt.dataTransfer.getData('text')
      let tmpEl = document.getElementById(movedElemId)
      let tmpId = tmpEl.id
      let tmpHtml = tmpEl.innerHTML
      let items = document.querySelectorAll('.layer_tab')
      for (let i = 0; i < items.length; i++) {
        let layerTab = items[i]
        if (layerTab.innerHTML === tmpHtml && layerTab.id !== tmpId) {
          // We got a match. Toggle eyeball.
          let tds = layerTab.parentElement.parentElement.children
          let eye = tds[1].children[0]
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          layerTab.classList.remove('highlight')
          layerTab.classList.add('highlight')
          break
        }
      }
      // viewer
      let targetViewer = getViewerObject(closestViewer)
      let layerNum = movedElemId[0] // 1st char is array index
      layerNum = parseInt(layerNum)
      targetViewer.world.getItemAt(layerNum).setOpacity(1) // show
      // sourceViewer.world.getItemAt(layerNum).setOpacity(0) // hide
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
