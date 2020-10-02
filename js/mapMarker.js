// right-click, add map marker
function mapMarker (currentViewer, syncedViewers) {
  preventModal(currentViewer.element)

  currentViewer.addHandler('canvas-nonprimary-press', function (event) {
    if (event.button === 2) { // Right mouse
      const webPoint = event.position
      const viewportPoint = currentViewer.viewport.pointFromPixel(webPoint)

      const list = document.querySelectorAll('#btnMapMarker')
      list.forEach(function (item) {
        item.style.display = 'block'
      })
      displayMapMarker(viewportPoint)
    }
  })

  const elementList = document.querySelectorAll('#btnMapMarker')
  elementList.forEach(function (elem) {
    let overlay = false
    let s, h
    elem.addEventListener('click', function () {
      if (overlay) {
        s = 'block'
        h = '<i class="fa fa-map-marker"></i> Hide markers'
      } else {
        s = 'none'
        h = '<i class="fa fa-map-marker"></i> Show markers'
      }
      this.innerHTML = h
      document.querySelectorAll('#the-map-marker').forEach(function (thing) {
        thing.style.display = s
      })
      overlay = !overlay
    })
  })

  function preventModal (viewerDiv) {
    viewerDiv.addEventListener('contextmenu', function (event) {
      event.preventDefault()
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

  function addMarkerToViewer (point, viewer) {
    const link = createLink()
    viewer.addOverlay({
      element: link,
      location: point,
      placement: 'BOTTOM',
      checkResize: false
    })
  }

  function displayMapMarker (point) {
    syncedViewers.forEach(function (item) {
      const viewer = item.getViewer()
      if (viewer.id === currentViewer.id) {
        return
      }
      addMarkerToViewer(point, viewer)
    })
  }
}
