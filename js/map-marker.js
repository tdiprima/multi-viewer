map_marker = function (currentViewer, syncedViewers) {

    // prevent modal
    $(currentViewer.element).on('contextmenu', function (event) {
        event.preventDefault();
    });

    // right-click
    currentViewer.addHandler('canvas-nonprimary-press', (event) => {
        if (event.button === 2) { // Right mouse
            const webPoint = event.position;
            const viewportPoint = currentViewer.viewport.pointFromPixel(webPoint);
            displayPinIcon(viewportPoint);
        }
    });

    function createLink() {
        let rand = Math.floor(Math.random() * 11);
        let link = document.createElement('a');
        let href = "#";
        link.href = href;
        link.dataset.href = href;
        link.id = 'map-marker-' + rand;
        link.className = 'fa fa-map-marker';
        link.style.cssText =
            ' text-decoration: none; font-size: 22px; color: red;' +
            ' cursor: pointer';
        return link;
    }

    function thisViewer(point) {
        let link = createLink();
        currentViewer.addOverlay({
            element: link,
            location: point,
            placement: 'BOTTOM',
            checkResize: false
        });
        // mousetracker(link, currentViewer);
    }

    function allOtherViewers(point) {
        syncedViewers.forEach(function (item) {
            let viewer = item.getViewer()
            if (viewer.id === currentViewer.id) {
                return;
            }
            let link = createLink();
            viewer.addOverlay({
                element: link,
                location: point,
                placement: 'BOTTOM',
                checkResize: false
            });
            // mousetracker(link, viewer);
        });
    }

    // display map marker
    function displayPinIcon(point) {
        allOtherViewers(point);
        // thisViewer(point);
    }

    // TODO: disable fabricjs event handlers
    // target osd-overlaycanvas-1
    function mousetracker(link, viewer) {
        new OpenSeadragon.MouseTracker({
            element: link,
            clickHandler: function () {
                console.log('clickHandler')
                // do what u want to do
            },
            dragHandler: function (event) {
                console.log('dragHandler')
                // do what u want to do
            }
        });
    }

}
