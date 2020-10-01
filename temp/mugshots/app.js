(function () {
    window.addEventListener('load', function () {

        // Here's the Image Information Request URI
        const imgUrl = 'https://libimages1.princeton.edu/loris/pudl0001/4609321/s42/00000001.jp2'
        const size = 256;
        let viewer, canvas, vpt;

        // Fetch the image metadata
        fetch(imgUrl + '/info.json')
          .then(response => response.json())
          .then(data => {
              createViewer(data);
              createScroller(data);
          });

        // Set up OSD viewer with info that we fetched
        function createViewer(tileSourceIIIF) {

            // Create viewer
            viewer = OpenSeadragon({
                id: "contentDiv",
                prefixUrl: "//openseadragon.github.io/openseadragon/images/",
                tileSources: [{
                    tileSource: tileSourceIIIF
                }]
            });

            // Create viewer-associated things
            vpt = viewer.viewport;

            let overlay = viewer.fabricjsOverlay({
                scale: 1000
            });
            canvas = overlay.fabricCanvas();

        }

        // Create thumbnail scroller
        function createScroller(imgData) {

            let length = 1;
            let ul, li, span;

            let fragment = document.createDocumentFragment();
            ul = document.createElement('ul');
            ul.classList.add("thumbnail-list");
            fragment.appendChild(ul);

            // List elements
            for (let j = 0; j < length; j++) {
                // Set up unordered list, list item (magic is done in css)
                li = document.createElement('li');
                ul.appendChild(li);
                span = document.createElement('span');
                // Create thumbnail
                // createThumbnail(imgData, span);
                createThumbnail(imgData, span, 500, 500) // TESTING
                // Append thumbnail
                li.appendChild(span);

            }
            document.getElementById('thumbnail-container').appendChild(fragment);
        }

        // Generate random location points to select the thumbnail from
        function getRandomRect(imgData) {
            // stay within bounds
            const left = Math.floor(Math.random() * (imgData.width / 2)) + 1;
            const top = Math.floor(Math.random() * (imgData.height / 2)) + 1;

            // let left = Math.floor(Math.random() * (imgData.width - size));
            // let top = Math.floor(Math.random() * (imgData.height - size));

            return new OpenSeadragon.Rect(left, top, size, size);
        }

        function createThumbnail(imgData, span, x, y) {

            let rect; // it's a rectangle

            // check x, y variables
            if (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0) {
                console.log('got x,y')
                rect = new OpenSeadragon.Rect(x, y, size, size); // use them
            } else {
                console.log('random')
                rect = getRandomRect(imgData); // get random
            }

            let imgElement = document.createElement("IMG");
            imgElement.alt = 'mugshot';
            imgElement.classList.add("thumbnail-image");

            // Here's the Image Request URI:
            imgElement.src = imgUrl + '/' + rect.getTopLeft().x + ',' + rect.getTopLeft().y + ',' + rect.width + ',' + rect.height + '/full/0/default.jpg';

            // Append thumbnail
            span.appendChild(imgElement);

            // Thumbnail event listener
            imgElement.addEventListener('click', function () {
                showThumbnailOnImage(rect);
            });

        }

        // Show thumbnail's location in image & highlight the location
        function showThumbnailOnImage(rect) {
            console.log('rect', rect);
            zoomToLocation(rect)
            highlightLocation(rect)
        }

        function zoomToLocation(rect) {

            // Get the center, for panTo()
            let center = rect.getCenter();
            // Convert to viewport
            let vptCenter = vpt.imageToViewportCoordinates(center);
            // Pan there and magnify by X
            vpt.panTo(vptCenter);
            vpt.zoomTo(vpt.getMaxZoom());

        }

        function getCanvasPosition1(rect) {

            let topLeft = rect.getTopLeft(); // in image coords
            let newPoint;

            // let viewportPoint = vpt.imageToViewportCoordinates(topLeft);
            // newPoint = vpt.viewportToWindowCoordinates(viewportPoint); // too far southeast
            // console.log('newPoint1', newPoint);

            newPoint = vpt.imageToWindowCoordinates(topLeft); // too far southeast
            console.log('newPoint2', newPoint);

            // Yeah, no:
            // let topX = topLeft.x / vpt.getMaxZoom(); // divided by max zoom
            // let topY = topLeft.y / vpt.getMaxZoom();
            // newPoint = new OpenSeadragon.Point(topX, topY);
            // // Convert image coordinates to pixel coordinates relative to the window. Note: not accurate with multi-image.
            // newPoint = vpt.imageToWindowCoordinates(newPoint);
            // console.log('newPoint3', newPoint);

            // Yeah, really no:
            // newPoint = new OpenSeadragon.Point(topLeft.x, topLeft.y); // just use image points
            // console.log('newPoint4', newPoint);

            return newPoint;
        }

        function getCanvasPosition(rect) {
            // Assuming you know the pixel width and height of the image, you can do this:
            let topLeft = vpt.imageToViewerElementCoordinates(rect.getTopLeft());
            let bottomRight = vpt.imageToViewerElementCoordinates(rect.getBottomRight());
            console.log('rect bounds', rect)
            console.log('topLeft', topLeft)
            console.log('bottomRight', bottomRight)

            return topLeft;
        }

        // Create rectangle
        function highlightLocation(rect) {

            // 1. Coordinates.  Convert to canvas coordinates, for fabric.js
            // let newPoint = getCanvasPosition1(rect);
            let newPoint = getCanvasPosition(rect);

            // 2. Zoom. We're magnifying by X, so that square gotta be that many times smaller.

            // make bounding box small for hi-res
            let new_size = size / vpt.getMaxZoom();

            // add rectangle onto canvas
            canvas.add(new fabric.Rect({
                left: newPoint.x,
                top: newPoint.y,
                stroke: 'yellow',
                strokeWidth: 1,
                fill: '',
                width: new_size,
                height: new_size
            }));

        }
    });
})();
