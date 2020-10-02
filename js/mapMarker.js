function mapMarker (currentOSDViewer, syncedNViewers) {
  preventModal(currentOSDViewer.element)

  getPositionAndDisplayMarker()

  handleButtonShowHide()

  function preventModal (viewerDiv) {
    viewerDiv.addEventListener('contextmenu', function (mouseEvent) {
      mouseEvent.preventDefault()
    })
  }

  function getPositionAndDisplayMarker () {
    currentOSDViewer.addHandler('canvas-nonprimary-press', function (osdEvent) {
      if (isRightClick(osdEvent)) {
        const clickPosition = osdEvent.position
        const clickPositionViewport = currentOSDViewer.viewport.pointFromPixel(clickPosition)

        const buttons = document.querySelectorAll('#btnMapMarker')
        buttons.forEach(function (item) {
          item.style.display = 'block'
        })
        displayMapMarker(clickPositionViewport)
      }
    })
  }

  function isRightClick (evt) {
    return (evt.button === 2)
  }

  function displayMapMarker (point) {
    syncedNViewers.forEach(function (item) {
      const viewer = item.getViewer()
      if (viewer.id === currentOSDViewer.id) {
        return
      }
      addMarkerToViewer(point, viewer)
    })
  }

  function addMarkerToViewer (point, viewer) {
    const link = createLink()
    viewer.addOverlay({
      element: link,
      location: point,
      placement: 'BOTTOM',
      checkResize: false
    })
  }

  function createLink () {
    const link = document.createElement('a')
    const href = '#'
    link.href = href
    link.dataset.href = href
    link.id = 'the-map-marker'
    link.className = 'fa fa-map-marker'
    link.style.cssText =
      ' text-decoration: none; font-size: 22px; color: red;' +
      ' cursor: pointer'
    return link
  }

  function handleButtonShowHide () {
    const buttons = document.querySelectorAll('#btnMapMarker')
    buttons.forEach(function (elem) {
      let markersHaveBeenDrawn = false
      let style, html
      elem.addEventListener('click', function () {
        if (markersHaveBeenDrawn) {
          style = 'block'
          html = '<i class="fa fa-map-marker"></i> Hide markers'
        } else {
          style = 'none'
          html = '<i class="fa fa-map-marker"></i> Show markers'
        }
        this.innerHTML = html
        document.querySelectorAll('#the-map-marker').forEach(function (thing) {
          thing.style.display = style
        })
        markersHaveBeenDrawn = !markersHaveBeenDrawn
      })
    })
  }
}
