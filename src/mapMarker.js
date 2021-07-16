// On right-click in viewer, add map marker to the other viewers
const mapMarker = function (currentOSDViewer, syncedNViewers) {
  overrideRightClickMenu(currentOSDViewer.element)

  handleMarkerDisplay(currentOSDViewer, syncedNViewers)

  handleButtonShowHide()
}

function overrideRightClickMenu (viewerDiv) {
  viewerDiv.addEventListener('contextmenu', function (mouseEvent) {
    mouseEvent.preventDefault()
  })
}

function handleMarkerDisplay (currentOSDViewer, syncedNViewers) {
  currentOSDViewer.addHandler('canvas-nonprimary-press', function (osdEvent) {
    if (isRightClick(osdEvent)) {
      const clickPosition = osdEvent.position
      const clickPositionViewport = currentOSDViewer.viewport.pointFromPixel(clickPosition)

      const buttons = document.querySelectorAll('#btnMapMarker')
      buttons.forEach(function (item) {
        item.style.display = 'block'
      })
      displayMapMarker(clickPositionViewport, currentOSDViewer, syncedNViewers)
    }
  })
}

function isRightClick (evt) {
  return (evt.button === 2)
}

function displayMapMarker (point, currentOSDViewer, syncedNViewers) {
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
  const link = e('a', {'href': '#', 'id':'pin', 'class': 'fas fa-map-marker pointer'})
  link.style = 'text-decoration: none; font-size: 22px; color: red;'
  link.dataset.href = '#'
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
        html = '<i class="fas fa-map-marker"></i> Hide markers'
      } else {
        style = 'none'
        html = '<i class="fas fa-map-marker"></i> Show markers'
      }
      this.innerHTML = html
      document.querySelectorAll('#pin').forEach(function (thing) {
        thing.style.display = style
      })
      markersHaveBeenDrawn = !markersHaveBeenDrawn
    })
  })
}
