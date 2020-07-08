// stub
new OpenSeadragon.MouseTracker({
    element: link,
    clickHandler: function () {
        console.log('clickHandler')
        const href = this.element.getAttribute("data-href");
        const webPointX = this.element.offsetWidth / 2 + this.element.offsetLeft;
        const webPointY = this.element.offsetHeight / 2 + this.element.offsetTop;
        const viewportPoint = viewer.viewport.pointFromPixel(new OpenSeadragon.Point(webPointX, webPointY));
        displayPinIcon(viewportPoint, href);
    },
    dragHandler: function (event) {
        console.log('dragHandler')
        // Update the pin's overlay position from the given event parameters.
        let windowCoords = new OpenSeadragon.Point(event.originalEvent.x, event.originalEvent.y);
        let viewportCoords = viewer.viewport.windowToViewportCoordinates(windowCoords);
        // Create an overlay object from the element
        let overlay = viewer.getOverlayById(this.element);
        overlay.update(viewportCoords, OpenSeadragon.Placement.BOTTOM);
        overlay.drawHTML(this.element.parentNode, viewer.viewport);

    }
});
