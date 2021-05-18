let layers = function (button, arr, viewer, idx) {
  button.addEventListener('click', function (e) {
    console.log(button, arr, viewer, idx)
    createDraggableDiv('layers', 'Features', e.clientX, e.clientY)
    let div = document.getElementById('layersBody')
    let htm = '<table>'
    // let htm = ``
    // Fill in the body
    const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm;
    let arr1 = arr[idx]
    console.log('arr1', arr1)
    arr1.forEach(function (layer, index) {
      let name = layer.match(regex) // TODO: Need: name, unique id.
      if (!name) {
        name = 'unnamed'
      }
      htm += `<tr>
<td><span class="tab_links" id="${index + 'feat' + makeId(5)}" draggable="true">${name}</span></td>
<td><i class="fas fa-eye-slash" id="eye${index}"></i></td>
<td><i class="fas fa-palette" style="cursor: pointer;"></i></td>
</tr>`
      eyeball(`#eye${index}`)
    })
    htm += '</table>'
    div.innerHTML = htm
    handleDragLayers(viewer)
  })
}

let eyeball = function (jqId) {
  jQuery(function () {
    jQuery(jqId).click(function () {
      if (jQuery(this).hasClass('fa-eye-slash')) {
        jQuery(this).removeClass('fa-eye-slash')

        jQuery(this).addClass('fa-eye')

        jQuery('#password').attr('type', 'text')
      } else {
        jQuery(this).removeClass('fa-eye')

        jQuery(this).addClass('fa-eye-slash')

        jQuery('#password').attr('type', 'password')
      }
    })
  })
}

// DRAGGABLE LAYERS (previously in tabs, now list)
let handleDragLayers = function (viewer) {
  // Features in feature list
  let items = document.querySelectorAll('.tab_links')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  // The viewer, basically
  items = document.querySelectorAll('.tab')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }
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
    e.dataTransfer.setData('text', e.target.id)
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  function handleDrop(e) {
    e.stopPropagation()
    if (dragSrcEl !== this) {
      const target = e.target
      // get closest viewer element to where we dropped it
      const closestElement = target.closest('.viewer')
      if (!closestElement) {
        return false
      }
      // get the element that was dragged
      let movedElemId = e.dataTransfer.getData('text')
      // get the actual viewer object
      let targetViewer = getViewerObject(closestElement)
      let layerNum = movedElemId[0] // 1st char is array index
      layerNum = parseInt(layerNum) + 1 // (bc 0 = base)
      targetViewer.world.getItemAt(layerNum).setOpacity(1.0)
      sourceViewer.world.getItemAt(layerNum).setOpacity(0.0)
    }
    return false
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
