let demo = function () {

}

demo.execute = function (num_viewers, prod, options) {
    // Variables
    const arr = [];
    const style = "dragonbox";
    const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
    const id = "blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E";

    if (!options) {
        // default
        options = {
            filterOn: true,
            slidersOn: true,
            toolbarOn: true,
            multipleOn: true,
            paintbrushColor: "#0ff",
            viewerOpts: {
                showFullPageControl: false,
                showHomeControl: true,
                showZoomControl: false
            }
        }

        // default if single viewer
        if (num_viewers === 1) {
            options = {
                filterOn: true,
                slidersOn: true,
                toolbarOn: false,
                multipleOn: false,
                paintbrushColor: "#0ff"
            }
        }
    }

    // Create viewer(s)
    for (let i = 0; i < num_viewers; i++) {
        let v = new nViewer("viewer" + i, style, "viewers", options);
        arr.push(v);
    }

    // Viewers created; add dropdown to page
    new Dropdown(arr, 'selections', './json/tcga.json');

    function test() {
        // TESTING
        let dzi = "//openseadragon.github.io/example-images/duomo/duomo.dzi";
        arr.forEach(function (elem) {
            elem.getViewer().open(dzi)
        });
    }

    function live() {
        // Set viewer source
        arr.forEach(function (elem) {
            elem.setSources([iiif + "/tcgaimages/" + id + ".svs/info.json",
            iiif + "/featureimages/" + id + "-featureimage.tif/info.json"],
                [1.0, 1.0]);
        });
    }

    if (prod) {
        live();
    } else {
        test();
    }

    // Pan zoom controller
    sync = new Synchronizer(arr);  // Pass array of nViewers
}
