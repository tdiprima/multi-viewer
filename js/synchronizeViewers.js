// synchronize pan & zoom
function synchronizeViewers (imageViewerArray) {
  this.syncedImageViewers = []
  this.activeViewerId = null

  imageViewerArray.forEach(function (imageViewer) {
    const currentViewer = imageViewer.getViewer()

    setPanZoomCurrent(currentViewer, handler)

    mapMarker(currentViewer, this.syncedImageViewers) // set this up while we're here

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
    return numDivs !== 1
  }
}

function isZoomOn (imageViewer) {
  const checkboxes = imageViewer.getPanZoom()

  if (typeof checkboxes.checkZoom.checked !== 'undefined') {
    return checkboxes.checkZoom.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return numDivs !== 1
  }
}

function setPanZoomOthers (imageViewer) {
  let currentViewer = imageViewer.getViewer()

  this.syncedImageViewers.forEach(function (syncedObject) {
    const syncedViewer = syncedObject.getViewer()

    if (syncedViewer.id === currentViewer.id) {
      return
    }

    if (isPanOn(syncedObject) && isPanOn(imageViewer)) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter())
    }

    if (isZoomOn(syncedObject) && isZoomOn(imageViewer)) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom())
    }
  })
}

function resetFlag () {
  this.activeViewerId = null
}
