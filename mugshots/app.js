(function () {
    window.addEventListener('load', function () {

        // Here's the Image Information Request URI
        let imgUrl = 'https://libimages1.princeton.edu/loris/pudl0001/4609321/s42/00000001.jp2'
        let protocol = 'http://iiif.io/api/image';
        let viewer, canvas;

        // Fetch the metadata
        fetch(imgUrl + '/info.json')
            .then(response => response.json())
            .then(data => {
                createViewer(data);
                createScroller(data);
            });

        // Set up OSD viewer with info that we fetched
        function createViewer(data) {

            let imgWidth = data.width, imgHeight = data.height, tiles = data.tiles[0];
            // This part usually hard-coded in examples. Let's do it the proper way.
            let tileSourceIIIF = {
                "@context": protocol + "/2/context.json",
                "@id": imgUrl,
                "height": imgHeight,
                "width": imgWidth,
                "profile": [protocol + "/2/level2.json"],
                "protocol": protocol,
                "tiles": [{
                    "scaleFactors": tiles.scaleFactors,
                    "width": tiles.width
                }]
            };

            viewer = OpenSeadragon({
                id: "contentDiv",
                prefixUrl: "//openseadragon.github.io/openseadragon/images/",
                tileSources: [{
                    tileSource: tileSourceIIIF
                }]
            });

            let overlay = viewer.fabricjsOverlay({
                scale: 1000
            });
            canvas = this.__canvas = overlay.fabricCanvas();

        }

        // Create thumbnail scroller
        function createScroller(data) {

            let size = 256;
            let left, top;  //, canvas, context;
            let thumbnails = 5;
            let ul, li, span;

            let fragment = document.createDocumentFragment();
            ul = document.createElement('ul');
            ul.classList.add("thumbnail-list");
            fragment.appendChild(ul);

            // List elements
            for (let j = 0; j < thumbnails; j++) {
                li = document.createElement('li');
                ul.appendChild(li);
                left = Math.floor(Math.random() * (data.width / 2)) + 1;
                top = Math.floor(Math.random() * (data.height / 2)) + 1;
                span = document.createElement('span');

                createImage(span, left, top, size);

                li.appendChild(span);

            }

            document.getElementById('thumbnail-container').appendChild(fragment);
        }

        // Create thumbnail image
        function createImage(span, left, top, size) {
            let x = document.createElement("IMG");
            x.alt = 'mugshot';
            x.classList.add("thumbnail-image");

            // Here's the Image Request URI:
            x.src = imgUrl + '/' + left + ',' + top + ',' + size + ',' + size + '/full/0/default.jpg';

            x.addEventListener('click', function () {
                // Image to viewport coordinates
                let vpt = viewer.viewport;
                let imagePoint = new OpenSeadragon.Point(left, top);
                let viewportPoint = vpt.imageToViewportCoordinates(imagePoint);
                viewer.viewport.panTo(viewportPoint);
                viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());

                // Viewport to web coordinates
                let viewportWindowPoint = vpt.viewportToWindowCoordinates(viewportPoint);
                let x = Math.round(viewportWindowPoint.x);
                let y = Math.round(viewportWindowPoint.y);
                // fingers crossed

                // create a rectangle object
                let rect = new fabric.Rect({
                    left: x,
                    top: y,
                    stroke: 'yellow',
                    strokeWidth: 4,
                    fill: '',
                    width: size,
                    height: size
                });

                // "add" rectangle onto canvas
                canvas.add(rect);

            })
            span.appendChild(x);
        }
    });
})();

