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
    let feat = e('span', {class: 'layer_tab', id: `${layerNum}${makeId(5, 'feat')}`, draggable: 'true', display: 'block'})

    let loc = layer.location
    // fetch(loc)
    //   .then(response => response.json())
    //   .then(d => feat.innerHTML = d.prefLabel ? d.prefLabel : getStringRep(loc))

    // Fetch the preferred label
    if (loc.includes('info.json')) {
      fetch(loc)
        .then(response => response.json())
        .then(function (d) {
          if (d.prefLabel) {
            feat.innerHTML = d.prefLabel
            // TODO: temporary hack until we get prefLabel:
          } else if (loc.includes('HalcyonStorage') && loc.includes('TCGA')) {
            feat.innerHTML = loc.substring(loc.indexOf('HalcyonStorage') + 15, loc.indexOf('TCGA') - 1)
          } else if (loc.includes('TCGA')) {
            if (loc.match(regex) !== null)
              feat.innerHTML = loc.match(regex)[0]
            else
              feat.innerHTML = getStringRep(loc)
          } else {
            feat.innerHTML = getStringRep(loc)
          }
        })
    } else {
      feat.innerHTML = 'Feature'
    }
    tr.appendChild(e('td', {}, [feat]))

    // eyeball visibility toggle
    faEye = e('i', { id: makeId(5, 'eye'), class: layer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'})
    tr.appendChild(e('td', {}, [faEye]))

    // transparency slider
    let faAdjust = document.createElement('i')
    faAdjust.classList.add('fas')
    faAdjust.classList.add('fa-adjust')
    faAdjust.classList.add('hover-light')
    faAdjust.style.cursor = 'pointer'
    let div = e('div', {class: 'showDiv'}, [faAdjust])

    let range = e('input', {type: 'range', id: makeId(5, 'range'), min: '0', max: '100', step: '0.1', value: (layer.opacity * 100).toString()})
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
      let colorsUI = filters(palette, layer, itemsToBeDisplayed, viewer)
      palette.addEventListener('click', function (e) {
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
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  // The viewer, basically
  items = document.querySelectorAll('.drop_site')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault()
    return false
  }

  function handleDragEnter(e) {
    this.classList.add('over')
  }

  function handleDragLeave(e) {
    this.classList.remove('over')
  }

  function handleDragStart(e) {
    this.style.opacity = '0.4'
    dragSrcEl = this // The draggable feature
    sourceViewer = viewer
    e.dataTransfer.effectAllowed = 'move'
    // console.log('e.target.id', e.target.id)
    e.dataTransfer.setData('text', e.target.id)
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  /************ HANDLE DROP ************/
  function handleDrop(e) {
    if (e.preventDefault) e.preventDefault()

    if (dragSrcEl !== this) {
      // TARGET
      const target = e.target
      const closestViewer = target.closest('.viewer')
      if (!closestViewer) {
        return false
      }

      // DRAGGED ITEM
      let movedElemId = e.dataTransfer.getData('text')
      let tmpEl = document.getElementById(movedElemId)
      let tmpId = tmpEl.id
      let tmpHtml = tmpEl.innerHTML
      let items = document.querySelectorAll('.layer_tab')
      for (let i = 0; i < items.length; i++) {
        let layerTab = items[i]
        if (layerTab.innerHTML === tmpHtml && layerTab.id !== tmpId) {
          // Great, we got a match.
          // Toggle eyeball.
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
      targetViewer.world.getItemAt(layerNum).setOpacity(1)
      // sourceViewer.world.getItemAt(layerNum).setOpacity(0)
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
    let j
    for (j = 0; j < syncedImageViewers.length; j++) {
      if (syncedImageViewers[j].getViewer().id === element.id) {
        retVal = syncedImageViewers[j].getViewer()
        break
      }
    }
  } catch (e) {
    console.error('getViewerObject:', e.message)
  }

  return retVal
}
