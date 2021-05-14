let layers = function (button, arr, viewer) {

  button.addEventListener('click', function (e) {
    createDraggableDiv('layers', 'Features', e.clientX, e.clientY)
    let div = document.getElementById('layersBody')
    // Fill in the body
    const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm;
    arr.forEach(function (arr1) {
      arr1.forEach(function (layer) {
        let name = layer.match(regex) // TODO: I need actual names!
        if (!name) {
          name = 'unnamed'
        }
        let p = document.createElement('p')
        p.innerHTML = name
        div.appendChild(p)
      })
    })
  })
}

// DRAGGABLE LAYER TABS
let handleDraggable = function () {
  let items = document.querySelectorAll('.tab_links')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    // item.addEventListener('click', handleDragStart) // will this fix it?
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

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
    sourceViewer = whichViewer(dragSrcEl.parentElement.parentElement)
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
      // get the element that was dragged
      let movedTab = e.dataTransfer.getData('text')
      // get the (new) parent element
      let parent = e.target.parentElement
      // Only drop to specific elements
      if (parent.classList.contains('divSquare')) {
        e.target.appendChild(document.getElementById(movedTab))
        // TODO: Keep track of which tab belongs to what layer number.
        let layer
        let targetViewer = whichViewer(parent)
        layer = targetViewer.world.getItemCount() - 1 // get the last layer (TODO: change)
        targetViewer.world.getItemAt(layer).setOpacity(1.0)
        layer = sourceViewer.world.getItemCount() - 1 // get the last layer
        sourceViewer.world.getItemAt(layer).setOpacity(0.0)
      }
    }
    return false
  }
}

function whichViewer(element) {
  let children = element.children
  let retVal, i, j
  for (i = 0; i < children.length; i++) {
    let el = children[i]
    if (el.classList.contains('viewer')) {
      try {
        // It's this viewer. Retrieve the viewer object.
        // syncedImageViewers = global variable set in synchronizeViewers.js
        for (j = 0; j < syncedImageViewers.length; j++) {
          if (syncedImageViewers[j].getViewer().id === el.id) {
            retVal = syncedImageViewers[j].getViewer()
            break
          }
        }
      } catch (e) {
        console.warn('No syncedImageViewers')
      }
    }
  }
  return retVal
}
