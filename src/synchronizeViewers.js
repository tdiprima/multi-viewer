// Synchronize pan & zoom
const synchronizeViewers = function (imageViewerArray) {
  const isGood = checkData(imageViewerArray)

  if (isGood) {
    this.syncedImageViewers = []
    this.activeViewerId = null
    this.numViewers = imageViewerArray.length

    imageViewerArray.forEach(function (imageViewer) {
      const currentViewer = imageViewer.getViewer()

      setPanZoomCurrent(currentViewer, handler)

      // set this up while we're here
      mapMarker(currentViewer, this.syncedImageViewers)

      function handler () {
        if (!isActive(currentViewer.id)) {
          return
        }

        setPanZoomOthers(imageViewer)

        resetFlag()
      }

      this.syncedImageViewers.push(imageViewer)
    })
  }
}

function setPanZoomCurrent (currentViewer, handler) {
  currentViewer.addHandler('pan', handler)
  currentViewer.addHandler('zoom', handler)
}

function isActive (currentId) {
  init(currentId)
  return currentId === this.activeViewerId
}

function init (currentId) {
  if (!isRealValue(this.activeViewerId)) {
    this.activeViewerId = currentId
  }
}

function isPanOn (imageViewer) {
  const checkboxes = imageViewer.getPanZoom()

  if (typeof checkboxes.checkPan.checked !== 'undefined') {
    return checkboxes.checkPan.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return this.numViewers !== 1
  }
}

function isZoomOn (imageViewer) {
  const checkboxes = imageViewer.getPanZoom()

  if (typeof checkboxes.checkZoom.checked !== 'undefined') {
    return checkboxes.checkZoom.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return this.numViewers !== 1
  }
}

function setPanZoomOthers (imageViewer) {
  const currentViewer = imageViewer.getViewer()

  this.syncedImageViewers.forEach(function (syncedObject) {
    const syncedViewer = syncedObject.getViewer()

    if (syncedViewer.id === currentViewer.id) {
      return
    }

    if (isPanOn(syncedObject) && isPanOn(imageViewer)) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter(false), false)
    }

    if (isZoomOn(syncedObject) && isZoomOn(imageViewer)) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom(false))
    }
  })
}

function resetFlag () {
  this.activeViewerId = null
}

function checkData (imageViewerArray) {
  if (isEmpty(imageViewerArray)) {
    console.error('synchronizeViewers.js: Expected input argument, but received none.')
    return false
  }

  if (!(imageViewerArray[0] instanceof Object)) {
    console.error('synchronizeViewers.js: Array elements should be MultiViewer objects.')
    return false
  }

  return true
}
