function viewerSynchronizer (viewerArray) {
  const syncedViewers = []
  let activeViewerId = null

  viewerArray.forEach(function (elem) {
    const currentViewer = elem.getViewer()

    currentViewer.addHandler('pan', handler)
    currentViewer.addHandler('zoom', handler)

    locationPin(currentViewer, syncedViewers)

    function handler (event) {
      if (activeViewerId === null) {
        activeViewerId = currentViewer.id
      }

      if (activeViewerId !== currentViewer.id) {
        return
      }

      // As for everybody else...
      syncedViewers.forEach(function (item) {
        const view = item.getViewer()
        if (view.id === currentViewer.id) {
          return
        }

        // other viewers' coords set to my coordinates
        // EXCEPT...
        if (item.getChkPan() && elem.getChkPan()) {
          view.viewport.panTo(currentViewer.viewport.getCenter())
        }
        if (item.getChkZoom() && elem.getChkZoom()) {
          view.viewport.zoomTo(currentViewer.viewport.getZoom())
        }
      })
      // magic support
      activeViewerId = null
    }

    syncedViewers.push(elem)
  })
}
