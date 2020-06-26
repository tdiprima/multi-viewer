map_marker = function (currentViewer, syncedViewers) {
    //canvas-click
    currentViewer.addHandler('canvas-nonprimary-press', function (event) {
        const webPoint = event.position;
        const viewportPoint = currentViewer.viewport.pointFromPixel(webPoint);
        displayPinIcon(viewportPoint);
    });

    function displayPinIcon(point) {
        syncedViewers.forEach(function (item) {
            let viewer = item.getViewer()
            if (viewer.id === currentViewer.id) {
                return;
            }

            let link = document.createElement('a');
            link.href = '#';
            link.dataset.href = '#';
            link.id = 'pin-something';

            link.className = 'fa fa-map-marker';
            link.style.cssText =
                ' text-decoration: none; font-size: 22px; color: red;' +
                ' cursor: pointer';

            viewer.addOverlay({
                element: link,
                location: point,
                placement: 'BOTTOM',
                checkResize: false
            });
        });
    }
}
