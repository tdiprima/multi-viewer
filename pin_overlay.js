pin_overlay = function(viewer) {
    // canvas-nonprimary-press
    viewer.addHandler('canvas-click', function (event) {
        const webPoint = event.position;
        const viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    
        console.log("webPoint", webPoint);
        console.log("viewportPoint", viewportPoint);
    
        displayPinIcon(viewportPoint);
    });
    
    function displayPinIcon(point, item) {
        var siteId = "siteId"
        let href = '/sitemaps/edit-pin/' + siteId;
        if (typeof item !== 'undefined') {
            href += '/' + item;
        }
    
        let link = document.createElement('a');
        link.href = '#';
        link.dataset.href = href;
        link.id = 'pin-' + item;
        link.className = 'fas fa-map-marker';
        link.style.cssText =
            ' text-decoration: none; font-size: 22px; color: red;' +
            ' cursor: pointer';
    
        viewer.addOverlay({
            element: link,
            location: point,
            placement: 'BOTTOM',
            checkResize: false
        });
    
        new OpenSeadragon.MouseTracker({
            element: link,
            clickHandler: function () {
                const href = this.element.getAttribute("data-href");
                const webPointX = this.element.offsetWidth / 2 + this.element.offsetLeft;
                const webPointY = this.element.offsetHeight / 2 + this.element.offsetTop;
                const viewportPoint = viewer.viewport.pointFromPixel(new OpenSeadragon.Point(webPointX, webPointY));
                displayPinOverlay(href, viewportPoint);
            },
            dragHandler: function (event) {
                // Update the pin's overlay position from the given event parameters.
                let windowCoords = new OpenSeadragon.Point(event.originalEvent.x, event.originalEvent.y);
                let viewportCoords = viewer.viewport.windowToViewportCoordinates(windowCoords);
                // Create an overlay object from the element
                let overlay = viewer.getOverlayById(this.element);
                overlay.update(viewportCoords, OpenSeadragon.Placement.BOTTOM);
                overlay.drawHTML(this.element.parentNode, viewer.viewport);
    
            }
        });
    }
    
}
