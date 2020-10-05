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

function setPanZoomOnOtherViewers (currentViewer, correspondingObject) {
  this.syncedObjects.forEach(function (syncedObject) {
    const syncedViewer = syncedObject.getViewer()
    if (syncedViewer.id === currentViewer.id) {
      return
    }

    if (syncedObject.getChkPan() && correspondingObject.getChkPan()) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter())
    }

    if (syncedObject.getChkZoom() && correspondingObject.getChkZoom()) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom())
    }
  })
}

function resetFlag () {
  this.activeViewerId = null
}
