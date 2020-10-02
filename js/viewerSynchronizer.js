function viewerSynchronizer (nViewerArray) {
  const syncedObjects = []
  let activeViewerId = null

  nViewerArray.forEach(function (nViewerObject) {
    const currentViewer = nViewerObject.getViewer()

    setPanZoomOnCurrentViewer(currentViewer, handler)

    mapMarker(currentViewer, syncedObjects)

    function handler () {
      if (!isActive(currentViewer.id)) {
        return
      }

      setPanZoomOnOtherViewers(currentViewer, nViewerObject)

      reset()
    }

    syncedObjects.push(nViewerObject)
  })

  function setPanZoomOnCurrentViewer (currentViewer, handler) {
    currentViewer.addHandler('pan', handler)
    currentViewer.addHandler('zoom', handler)
  }

  function isActive (currentId) {
    init(currentId)

    if (activeViewerId !== currentId) {
      return false
    } else {
      return true
    }
  }

  function init (currentId) {
    if (!isRealValue(activeViewerId)) {
      activeViewerId = currentId
    }
  }

  function setPanZoomOnOtherViewers (currentViewer, correspondingObject) {
    syncedObjects.forEach(function (syncedObject) {
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

  function reset () {
    activeViewerId = null
  }
}
