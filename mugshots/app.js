(function () {
    window.addEventListener('load', function () {

        let imgUrl = 'https://libimages1.princeton.edu/loris/pudl0001/4609321/s42/00000001.jp2'
        let protocol = 'http://iiif.io/api/image';
        let viewer;

        fetch(imgUrl + '/info.json')
            .then(response => response.json())
            .then(data => {
                createViewer(data);
                createScroller(data);
            });

        function createViewer(data) {
            let imgWidth = data.width, imgHeight = data.height, tiles = data.tiles[0];
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
                    tileSource: tileSourceIIIF,
                    width: 1,
                    y: 0,
                    x: 1.1
                }]
            });

        }

        function createScroller(data) {

            let size = 256;
            let left, top;  //, canvas, context;
            let rows = 1, cols = 5;
            let fragment = document.createDocumentFragment();
            let tbl = document.createElement('table');
            fragment.appendChild(tbl);

            for (let i = 0; i < rows; i++) {
                row = document.createElement('tr');
                tbl.appendChild(row);

                // n columns
                for (let j = 0; j < cols; j++) {
                    left = Math.floor(Math.random() * (data.width / 2)) + 1;
                    top = Math.floor(Math.random() * (data.height / 2)) + 1;
                    col = document.createElement('td');

                    createImage(col, left, top, size);

                    row.appendChild(col);

                }
            }
            document.getElementById('thumbnailsScroller').appendChild(fragment);
        }

        function createImage(col, left, top, size) {
            let x = document.createElement("IMG");
            x.alt = 'mugshot';
            x.height = size;
            x.width = size;
            // x.id = ''
            x.src = imgUrl + '/' + left + ',' + top + ',' + size + ',' + size + '/full/0/default.jpg';
            // TODO:
            x.addEventListener('click', function () {
                // viewer.viewport.panTo(currentViewer.viewport.getCenter());
                // viewer.viewport.zoomTo(currentViewer.viewport.getZoom());
                // TODO: so change img coords to viewport coords
                viewer.viewport.panBy(left, top);
                viewer.viewport.zoomBy(2);
            })
            // console.log('iiif', x.src);
            col.appendChild(x);
        }

        // Create canvas if I wanna draw on it
        function createImage1(col, left, top, size) {
            canvas = document.createElement('canvas');
            context = canvas.getContext("2d");
            canvas.width = size;
            canvas.height = size;
            col.append(canvas);
            let x = new Image();
            x.onload = function () {
                context.drawImage(x, 0, 0);
            };
            // ...jp2 / 0, 0, 4096, 4096 / 1024, /0/default.jpg
            // https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2/0,0,4096,4096/1024,/0/default.jpg
            x.src = imgUrl + '/' + left + ',' + top + ',' + size + ',' + size + '/full/0/default.jpg';
            console.log('iiif', x.src);
        }

    });
})();
