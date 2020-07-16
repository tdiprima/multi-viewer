/**
 * Handler for right-click, add map marker.
 * @param currentViewer
 * @param syncedViewers
 */
map_marker = function (currentViewer, syncedViewers) {

    const idx = currentViewer.id.trim(-1).replace("viewer", "");

    // prevent modal
    $(currentViewer.element).on('contextmenu', function (event) {
        event.preventDefault();
    });

    // right-click
    currentViewer.addHandler('canvas-nonprimary-press', (event) => {
        if (event.button === 2) { // Right mouse
            const webPoint = event.position;
            const viewportPoint = currentViewer.viewport.pointFromPixel(webPoint);
            // document.getElementById("btnMap" + idx).style.display = 'block';
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

    function doOverlay(point, viewer) {
        let link = createLink();
        viewer.addOverlay({
            element: link,
            location: point,
            placement: 'BOTTOM',
            checkResize: false
        });
        mousetracker(link, viewer);

    }

    // display map marker
    function displayPinIcon(point) {
        const all = true; // temporarily
        if (all) {
            // Show on all other viewers
            syncedViewers.forEach(function (item) {
                let viewer = item.getViewer()
                if (viewer.id === currentViewer.id) {
                    return;
                }
                doOverlay(point, viewer);
            });
        } else {
            // Show only on this viewer
            doOverlay(point, currentViewer)
        }
    }

    function mousetracker(link, viewer) {
        // TBA
        new OpenSeadragon.MouseTracker({
            element: link,
            clickHandler: function () {
                console.log('clickHandler');
                // etc
            },
            dragHandler: function (event) {
                console.log('dragHandler');
                // etc
            }
        });
    }

}
