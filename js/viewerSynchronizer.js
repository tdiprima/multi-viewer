function viewerSynchronizer (nViewerArray) {
  this.syncedObjects = []
  this.activeViewerId = null

  nViewerArray.forEach(function (nViewerObject) {
    const currentViewer = nViewerObject.getViewer()

    setPanZoomOnCurrentViewer(currentViewer, handler)

    mapMarker(currentViewer, this.syncedObjects)

    function handler () {
      if (!isActive(currentViewer.id)) {
        return
      }

      setPanZoomOnOtherViewers(currentViewer, nViewerObject)

      resetFlag()
    }

    this.syncedObjects.push(nViewerObject)
  })
}

function setPanZoomOnCurrentViewer (currentViewer, handler) {
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

function isPanOn (someObject) {
  const checkboxes = someObject.getPanZoom()
  if (typeof checkboxes.checkPan.checked !== 'undefined') {
    return checkboxes.checkPan.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return numDivs !== 1
  }
}

function isZoomOn (someObject) {
  const checkboxes = someObject.getPanZoom()
  if (typeof checkboxes.checkZoom.checked !== 'undefined') {
    return checkboxes.checkZoom.checked // user decision
  } else {
    // If 1 div; then, nothing to synchronize.
    return numDivs !== 1
  }
}

function setPanZoomOnOtherViewers (currentViewer, correspondingObject) {
  this.syncedObjects.forEach(function (syncedObject) {
    const syncedViewer = syncedObject.getViewer()
    if (syncedViewer.id === currentViewer.id) {
      return
    }

    if (isPanOn(syncedObject) && isPanOn(correspondingObject)) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter())
    }

    if (isZoomOn(syncedObject) && isZoomOn(correspondingObject)) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom())
    }
  })
}

function resetFlag () {
  this.activeViewerId = null
}
